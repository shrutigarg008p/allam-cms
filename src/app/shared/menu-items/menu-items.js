"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var MENUITEMS = [
    {
        label: 'Navigation',
        main: [
            {
                state: 'dashboard',
                name: 'Dashboard',
                type: 'link',
                icon: 'ti-home'
            },
            {
                state: 'widget',
                name: 'Widget',
                type: 'link',
                icon: 'ti-view-grid',
                badge: [
                    {
                        type: 'danger',
                        value: '100+'
                    }
                ]
            }
        ],
    },
    {
        label: 'Role',
        main:[
            {
                state: 'role',
                name: 'Role',
                type: 'link',
                icon: 'ti-id-badge'
            }
        ]
    },
    {
        label: 'Category',
        main:[
            {
                state: 'category',
                name: 'Category',
                type: 'link',
                icon: 'ti-id-badge'
            }
        ]
    },
    {
        label: 'Study Exam',
        main:[
            {
                state: 'stuy-exam',
                name: 'Stuy Exam',
                type: 'link',
                icon: 'ti-id-badge'
            }
        ]
    },
    {
        label: 'teacher-supervisor', 
        main:[
            {
                state: 'teacher-supervisor',
                name: 'Teacher Supervisor',
                type: 'link',
                icon: 'ti-id-badge'
            }
        ]
    },
    {
        label: 'Sub Category',
        main:[
            {
                state: 'sub-category',
                name: 'Sub Category',
                type: 'link',
                icon: 'ti-id-badge'
            }
        ]
    },
    {
        label: 'Quiz',
        main: [
            {
                state: 'quiz',
                name: 'Quizzes',
                type: 'link',
                icon: 'ti-home'
            },
            {
                state: 'widget',
                name: 'Widget',
                type: 'link',
                icon: 'ti-view-grid',
                badge: [
                    {
                        type: 'danger',
                        value: '100+'
                    }
                ]
            }
        ],
    },
     {
        label: 'Question',
        main: [
            {
                state: 'question',
                name: 'Question',
                type: 'link',
                icon: 'ti-home'
            },
            {
                state: 'widget',
                name: 'Widget',
                type: 'link',
                icon: 'ti-view-grid',
                badge: [
                    {
                        type: 'danger',
                        value: '100+'
                    }
                ]
            }
        ],
    },
    {
        label: 'Users',
        main: [
            {
                state: 'users',
                name: 'Users',
                type: 'link',
                icon: 'ti-home'
            },
            {
                state: 'widget',
                name: 'Widget',
                type: 'link',
                icon: 'ti-view-grid',
                badge: [
                    {
                        type: 'danger',
                        value: '100+'
                    }
                ]
            }
        ],
    },
    {
        label: 'Broadcaster',
        main: [
            {
                state: 'broadcaster',
                name: 'Broadcaster',
                type: 'link',
                icon: 'ti-home'
            },
            {
                state: 'widget',
                name: 'Widget',
                type: 'link',
                icon: 'ti-view-grid',
                badge: [
                    {
                        type: 'danger',
                        value: '100+'
                    }
                ]
            }
        ],
    },
    {
        label: 'Referendum',
        main: [
            {
                state: 'referendum',
                name: 'Referendum',
                type: 'link',
                icon: 'ti-home'
            },
            {
                state: 'widget',
                name: 'Widget',
                type: 'link',
                icon: 'ti-view-grid',
                badge: [
                    {
                        type: 'danger',
                        value: '100+'
                    }
                ]
            }
        ],
    },
    {
        label: 'UI Element',
        main: [
            {
                state: 'basic',
                name: 'Basic Components',
                type: 'sub',
                icon: 'ti-layout-grid2-alt',
                children: [
                    {
                        state: 'alert',
                        name: 'Alert'
                    },
                    {
                        state: 'breadcrumb',
                        name: 'Breadcrumbs'
                    },
                    {
                        state: 'button',
                        name: 'Button'
                    },
                    {
                        state: 'accordion',
                        name: 'Accordion'
                    },
                    {
                        state: 'generic-class',
                        name: 'Generic Class'
                    },
                    {
                        state: 'tabs',
                        name: 'Tabs'
                    },
                    {
                        state: 'label-badge',
                        name: 'Label Badge'
                    },
                    {
                        state: 'typography',
                        name: 'Typography'
                    },
                    {
                        state: 'other',
                        name: 'Other'
                    },
                ]
            },
            {
                state: 'advance',
                name: 'Advance Components',
                type: 'sub',
                icon: 'ti-crown',
                children: [
                    {
                        state: 'modal',
                        name: 'Modal'
                    },
                    {
                        state: 'notifications',
                        name: 'Notifications'
                    },
                    {
                        state: 'notify',
                        name: 'PNOTIFY',
                        badge: [
                            {
                                type: 'info',
                                value: 'New'
                            }
                        ]
                    },
                ]
            },
            {
                state: 'animations',
                name: 'Animations',
                type: 'link',
                icon: 'ti-reload rotate-refresh'
            }
        ]
    },
    {
        label: 'Master Data',
        main: [
            {
                state: 'masterdata',
                name: 'Master Data',
                type: 'sub',
                icon: 'ti-layout-grid2-alt',
                children: [
                    {
                        state: 'school',
                        name: 'School'
                    },
                    {
                        state: 'university',
                        name: 'University'
                    },
                    
                ]
            }
        ]
    },
    {
        label: 'Forms',
        main: [
            {
                state: 'forms',
                name: 'Form Components',
                type: 'sub',
                icon: 'ti-layers',
                children: [
                    {
                        state: 'basic-elements',
                        name: 'Form Components'
                    }, {
                        state: 'add-on',
                        name: 'Form-Elements-Add-On'
                    }, {
                        state: 'advance-elements',
                        name: 'Form-Elements-Advance'
                    }, {
                        state: 'form-validation',
                        name: 'Form Validation'
                    }
                ]
            }, {
                state: 'picker',
                main_state: 'forms',
                name: 'Form Picker',
                type: 'link',
                icon: 'ti-pencil-alt',
                badge: [
                    {
                        type: 'warning',
                        value: 'New'
                    }
                ]
            }, {
                state: 'select',
                main_state: 'forms',
                name: 'Form Select',
                type: 'link',
                icon: 'ti-shortcode'
            }, {
                state: 'masking',
                main_state: 'forms',
                name: 'Form Masking',
                type: 'link',
                icon: 'ti-write'
            }
        ]
    },
    {
        label: 'Tables',
        main: [
            {
                state: 'bootstrap-table',
                name: 'Bootstrap Table',
                type: 'sub',
                icon: 'ti-receipt',
                children: [
                    {
                        state: 'basic',
                        name: 'Basic Table'
                    }, {
                        state: 'sizing',
                        name: 'Sizing Table'
                    }, {
                        state: 'border',
                        name: 'Border Table'
                    }, {
                        state: 'styling',
                        name: 'Styling Table'
                    }
                ]
            },
            {
                state: 'data-table',
                name: 'Data Table',
                type: 'sub',
                icon: 'ti-widgetized',
                children: [
                    {
                        state: 'basic',
                        name: 'Basic Table'
                    }
                ]
            }
        ]
    }
];
var MenuItems = (function () {
    function MenuItems() {
    }
    MenuItems.prototype.getAll = function () {
        return MENUITEMS;
    };
    return MenuItems;
}());
MenuItems = __decorate([
    core_1.Injectable()
], MenuItems);
exports.MenuItems = MenuItems;
