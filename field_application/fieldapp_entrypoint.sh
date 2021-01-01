#!/bin/sh
apt-get update -y
wine python --version
wine python -m pip install --upgrade pip
wine python -m pip --version
# wine python -m pip install setuptools --upgrade
# wine python -m pip install typed_ast‑1.1.0‑cp36‑cp36m‑win_amd64.whl
# wine python -m pip install -r /app/public/backend/requirements.txt
wine python -m pip list

apt-get install curl software-properties-common -y --fix-missing
curl -sL https://deb.nodesource.com/setup_12.x | bash -

ls -a ./
ls -a ./app/

cp ./app/api_exampel.spec.txt /app/api.spec

# wine pyinstaller ./app/api.spec --noconfirm --distpath ./app/public/backend_dist
wine pyinstaller