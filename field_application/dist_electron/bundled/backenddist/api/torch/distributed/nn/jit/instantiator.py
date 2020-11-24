#!/usr/bin/python3
import importlib
import logging
import os
import sys
import tempfile

import torch
from torch.distributed.nn.jit.templates.remote_module_template import (
    REMOTE_MODULE_TEMPLATE,
)


logger = logging.getLogger(__name__)


_FILE_PREFIX = "_remote_module_"
_TEMP_DIR = tempfile.TemporaryDirectory()
INSTANTIATED_TEMPLATE_DIR_PATH = _TEMP_DIR.name
logger.info(f"Created a temporary directory at {INSTANTIATED_TEMPLATE_DIR_PATH}")
sys.path.append(INSTANTIATED_TEMPLATE_DIR_PATH)


def get_arg_return_types_from_interface(module_interface):
    assert getattr(
        module_interface, "__torch_script_interface__", False
    ), "Expect a TorchScript class interface decorated by @torch.jit.interface."
    qualified_name = torch._jit_internal._qualified_name(module_interface)
    cu = torch.jit._state._python_cu
    module_interface_c = cu.get_interface(qualified_name)
    assert (
        "forward" in module_interface_c.getMethodNames()
    ), "Expect forward in interface methods, while it has {}".format(
        module_interface_c.getMethodNames()
    )
    method_schema = module_interface_c.getMethod("forward")

    arg_str_list = []
    arg_type_str_list = []
    for argument in method_schema.arguments:
        arg_str_list.append(argument.name)

        if argument.has_default_value():
            default_value_str = " = {}".format(argument.default)
        else:
            default_value_str = ""
        arg_type_str = "{name}: {type}{default_value}".format(
            name=argument.name, type=argument.type, default_value=default_value_str
        )
        arg_type_str_list.append(arg_type_str)

    arg_str_list = arg_str_list[1:]  # Remove "self".
    args_str = ", ".join(arg_str_list)

    arg_type_str_list = arg_type_str_list[1:]  # Remove "self".
    arg_types_str = ", ".join(arg_type_str_list)

    assert len(method_schema.returns) == 1
    argument = method_schema.returns[0]
    return_type_str = str(argument.type)

    return args_str, arg_types_str, return_type_str


def _write(out_path, text):
    try:
        with open(out_path, "r") as f:
            old_text = f.read()
    except IOError:
        old_text = None
    if old_text != text:
        with open(out_path, "w") as f:
            logger.info("Writing {}".format(out_path))
            f.write(text)
    else:
        logger.info("Skipped writing {}".format(out_path))


def _do_instantiate_remote_module_template(generated_module_name, str_dict):
    generated_code_text = REMOTE_MODULE_TEMPLATE.format(**str_dict)
    out_path = os.path.join(
        INSTANTIATED_TEMPLATE_DIR_PATH, f"{generated_module_name}.py"
    )
    _write(out_path, generated_code_text)

    # From importlib doc,
    # > If you are dynamically importing a module that was created since
    # the interpreter began execution (e.g., created a Python source file),
    # you may need to call invalidate_caches() in order for the new module
    # to be noticed by the import system.
    importlib.invalidate_caches()
    generated_module = importlib.import_module(f"{generated_module_name}")
    return generated_module


def instantiate_scriptable_remote_module_template(module_interface_cls):
    if not getattr(module_interface_cls, "__torch_script_interface__", False):
        raise ValueError(
            f"module_interface_cls {module_interface_cls} must be a type object decorated by "
            "@torch.jit.interface"
        )

    # Generate the template instance name.
    module_interface_cls_name = torch._jit_internal._qualified_name(module_interface_cls).replace(
        ".", "_"
    )
    generated_module_name = f"{_FILE_PREFIX}{module_interface_cls_name}"

    # Generate type annotation strs.
    assign_module_interface_cls_str = (
        f"from {module_interface_cls.__module__} import "
        f"{module_interface_cls.__name__} as module_interface_cls"
    )
    args_str, arg_types_str, return_type_str = get_arg_return_types_from_interface(
        module_interface_cls
    )
    kwargs_str = ""
    arrow_and_return_type_str = f" -> {return_type_str}"
    arrow_and_future_return_type_str = f" -> Future[{return_type_str}]"

    str_dict = dict(
        assign_module_interface_cls=assign_module_interface_cls_str,
        arg_types=arg_types_str,
        arrow_and_return_type=arrow_and_return_type_str,
        arrow_and_future_return_type=arrow_and_future_return_type_str,
        args=args_str,
        kwargs=kwargs_str,
        jit_script_decorator="@torch.jit.script",
    )
    return _do_instantiate_remote_module_template(generated_module_name, str_dict)


def instantiate_non_scriptable_remote_module_template():
    generated_module_name = f"{_FILE_PREFIX}non_sriptable"
    str_dict = dict(
        assign_module_interface_cls="module_interface_cls = None",
        args="*args",
        kwargs="**kwargs",
        arg_types="*args, **kwargs",
        arrow_and_return_type="",
        arrow_and_future_return_type="",
        jit_script_decorator="",
    )
    return _do_instantiate_remote_module_template(generated_module_name, str_dict)
