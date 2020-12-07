import emptyRouteView from "../views/EmptyRouteView.vue"

export const routes = [{
        path: "/",
        name: "landing",
        component: () =>
            import ("../views/Landing.vue"),
        meta: {
            title: "Landing"
        }
    },
    {
        path: "/dashboard",
        name: "dashboard",
        component: () =>
            import ("../views/Dashboard.vue"),
        meta: {
            researcher: true,
            title: "Dashboard",
            drawer: true
        },
    },
    {
        path: "/researches",
        component: emptyRouteView,
        meta: {
            researcher: true,
        },
        children: [{
                path: "",
                name: "researches",
                component: () =>
                    import ("@/views/Researches/Researches.vue"),
                meta: {
                    title: "Researches",
                    drawer: true
                }
            }, {
                path: "add",
                component: () =>
                    import ("@/views/Researches/AddResearch.vue"),
                meta: {
                    title: "Add research",
                    action: true,
                    from: "researches"
                }
            },
            {

                path: ":id",
                component: emptyRouteView,
                children: [{
                    path: "",
                    name: "research/:id",
                    component: () =>
                        import ("@/views/Researches/Research.vue"),
                    meta: {
                        title: "View Research",
                        from: "researches"
                    }
                }, ]
            }
        ]
    },
    {
        path: "/areas",
        component: emptyRouteView,
        meta: {
            researcher: true,
        },
        children: [{
                path: "",
                name: "areas",
                component: () =>
                    import ("@/views/Areas/Areas.vue"),
                meta: {
                    title: "Areas",
                    drawer: true
                },
            },
            {
                path: "add",
                name: "areas/add",
                component: () =>
                    import ("@/views/Areas/AddArea.vue"),
                meta: {
                    title: "Add area",
                    action: true,
                    from: "areas"
                }
            },
            {
                path: ":id",
                component: emptyRouteView,
                children: [{
                        path: "",
                        name: "areas/:id",
                        component: () =>
                            import ("@/views/Areas/Area.vue"),
                        meta: {
                            title: "View Area",
                            from: "areas"
                        }
                    },
                    {
                        path: "edit",
                        name: "areas/:id/edit",
                        component: () =>
                            import ("@/views/Areas/EditArea.vue"),
                        meta: {
                            title: "Edit Area",
                            from: "areas/:id"
                        }
                    }
                ]
            },
        ]
    },
    {
        path: "/models",
        component: emptyRouteView,
        meta: {
            researcher: true,
        },
        children: [{
                path: "",
                name: "models",
                component: () =>
                    import ("@/views/Models/Models.vue"),
                meta: {
                    title: "Models",
                    drawer: true
                }
            },
            {
                path: ":id",
                name: "models/:id",
                component: () =>
                    import ("@/views/Models/Model.vue"),
                meta: {
                    title: "Model",
                    action: true,
                    from: "models"
                }
            }
        ]
    },
    {
        path: "/users",
        component: emptyRouteView,
        meta: {
            researcher: true,
        },
        children: [{
                path: "",
                name: "users",
                component: () =>
                    import ("@/views/Users/Users.vue"),
                meta: {
                    title: "Users",
                    drawer: true
                }
            },
            {
                path: "add",
                name: "users/add",
                component: () =>
                    import ("@/views/Users/AddUser.vue"),
                meta: {
                    title: "Add user",
                    action: true,
                    from: "users"
                }
            }
        ]
    },
    {
        path: "/logout",
        name: "logout",
        component: () =>
            import ("../views/Logout.vue")
    },
    {
        path: "/account",
        name: "account",
        component: () =>
            import ("../views/Account.vue")
    },
    {
        path: "*",
        redirect: "/",
        name: "landing",
        component: () =>
            import ("../views/Landing.vue"),
    },
];