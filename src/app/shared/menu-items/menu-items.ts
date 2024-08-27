import {Injectable} from '@angular/core';

export interface BadgeItem {
  type: string;
  value: string;
}

export interface ChildrenItems {
  state: string;
  target?: boolean;
  name: string;
  type?: string;
  children?: ChildrenItems[];
}

export interface MainMenuItems {
  state: string;
  short_label?: string;
  main_state?: string;
  target?: boolean;
  name: string;
  type: string;
  icon: string;
  menukey: string;
  badge?: BadgeItem[];
  children?: ChildrenItems[];
}

export interface Menu {
  label: string;
  main: MainMenuItems[];
}

const MENUITEMS = [
  {
    label: 'Navigation',
    main: [
      {
        state: 'dashboard',
        short_label: 'D',
        name: 'Dashboard',
        type: 'link',
        icon: 'ti-home',
        menukey:'dashbiard',
      },
      {
        state: 'role',
        short_label: 'C',
        name: 'Role',
        type: 'link',
        icon: 'ti-files',
        menukey:'view-role'
      },
      {
        state: 'study-exam',
        short_label: 'se',
        name: 'Study Exam',
        type: 'link',
        icon: 'ti-files',
        menukey:'view-study-exam'
      },
       {
        state: 'study-exam-question',
        short_label: 'se',
        name: 'Study Exam',
        type: 'link',
        icon: 'ti-files',
        menukey:'stuyd-exam-question'
      },
      {
        state: 'category',
        short_label: 'C',
        name: 'Category',
        type: 'link',
        icon: 'ti-files',
        menukey:'view-category'
      },
      {
        state: 'header',
        short_label: 'C',
        name: 'Header',
        type: 'link',
        icon: 'ti-files',
        menukey:'view-header'
      },
     /* {
        state: 'sub-category',
        short_label: 'C',
        name: 'Sub Category',
        type: 'link',
        icon: 'ti-files',
        menukey:'view-sub-category'
      },*/
      {
        state: 'quiz',
        short_label: 'QZ',
        name: 'Quizzes',
        type: 'link',
        icon: 'ti-files',
        menukey:'view-quiz'
      },
      /*{
        state: 'question',
        short_label: 'Q',
        name: 'Question',
        type: 'link',
        icon: 'ti-book',
        menukey:'view-question'
      }, */
      {
        state: 'users',
        short_label: 'U',
        name: 'Users',
        type: 'link',
        icon: 'ti-user',
        menukey:'view-users'
      },
      {
        state: 'referendum',
        short_label: 'RR',
        name: 'Referendum',
        type: 'link',
        icon: 'ti-user',
        menukey:'view-referendum'

      },  
      {
        state: 'admin-referendum',
        short_label: 'AR',
        name: 'Admin Referendum',
        type: 'link',
        icon: 'ti-user',
        menukey:'admin-referendum'

      },  
      {
        state: 'mobile-users',
        short_label: 'MU',
        name: 'Mobile Users',
        type: 'link',
        icon: 'ti-user',
        menukey:'mobile-users'

      },
      {
        state: 'broadcaster',
        short_label: 'BR',
        name: 'Broadcaster',
        type: 'link',
        icon: 'ti-user',
        menukey:'view-broadcaster'

      },
      {
        state: 'daily',
        short_label: 'CR',
        name: 'Challenge Race',
        type: 'link',
        icon: 'ti-user',
        menukey:'view-daily',
      },
      {
        state: 'daily',
        short_label: 'B',
        name: 'Challenge Race',
        type: 'sub',
        icon: 'ti-layout-grid2-alt',
        menukey:'view-basics',
        children: [
          {
            state: 'list',
            short_label: 'ms',
            name: 'List of competition',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-daily-admin'
          }
        ]
      },
      {
        state: 'special',
        short_label: 'B',
        name: 'Special Competition',
        type: 'sub',
        icon: 'ti-layout-grid2-alt',
        menukey:'view-basics',
        children: [
          {
            state: 'list',
            short_label: 'ms',
            name: 'List of competition',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-special-admin'
          }
        ]
      },
      {
        state: 'league',
        short_label: 'B',
        name: 'League Competition',
        type: 'sub',
        icon: 'ti-layout-grid2-alt',
        menukey:'view-basics',
        children: [
          {
            state: 'list',
            short_label: 'ms',
            name: 'List of competition',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-league-admin'
          }
        ]
      },
      {
        state: 'reports',
        short_label: 'B',
        name: 'Download Reports',
        type: 'sub',
        icon: 'ti-layout-grid2-alt',
        menukey:'view-basics',
        children: [
          {
            state: 'daily',
            short_label: 'RCR',
            name: 'Challenge Race',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-daily-admin'
          },{
            state: 'special',
            short_label: 'ms',
            name: 'Special Competition',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-special-admin'
          }
        ]
      },
      {
        state: 'social-reports',
        short_label: 'B',
        name: 'Social Reports',
        type: 'sub',
        icon: 'ti-layout-grid2-alt',
        menukey:'view-basics',
        children: [
          {
            state: 'daily',
            short_label: 'RCR',
            name: 'Challenge Race',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-daily-admin'
          },{
            state: 'special',
            short_label: 'ms',
            name: 'Special Competition',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-special-admin'
          }
        ]
      },
      {
        state: 'leaderboard',
        short_label: 'LB',
        name: 'LeaderBoard',
        type: 'link',
        icon: 'ti-user',
        menukey:'view-leaderboard',
      },
      {
        state: 'userreport',
        short_label: 'LB',
        name: 'User Report',
        type: 'link',
        icon: 'ti-user',
        menukey:'view-user-report',
      },
      {
        state: 'usernotification',
        short_label: 'LB',
        name: 'Generic Notification',
        type: 'link',
        icon: 'ti-user',
        menukey:'view-user-notification',
      },
      {
        state: 'general-competition',
        short_label: 'GC',
        name: 'General Competition',
        type: 'link',
        icon: 'ti-layout-grid2-alt',
        menukey:'view-gc'
      },    
      {
        state: 'teacher-supervisor',
        short_label: 'TS',
        name: 'Approve Questions',
        type: 'link',
        icon: 'ti-layout-grid2-alt',
        menukey:'study-exam-approval'
      }, 
         
      {
        state: 'special',
        short_label: 'SC',
        name: 'Special Competition',
        type: 'link',
        icon: 'ti-user',
        menukey:'view-special'
      },
      {
        state: 'league',
        short_label: 'LG',
        name: 'League Competition',
        type: 'link',
        icon: 'ti-user',
        menukey:'view-league'
      },  
      {
        state: 'masterdata',
        short_label: 'B',
        name: 'Master Data',
        type: 'sub',
        icon: 'ti-layout-grid2-alt',
        menukey:'view-basic',
        children: [
          {
            state: 'country',
            short_label: 'ms',
            name: 'Country',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-country'
          },
          {
            state: 'district',
            short_label: 'mu',
            name: 'District',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-district'
          },
          {
            state: 'subject',
            short_label: 'ms',
            name: 'Subject',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-subject'
          },
          {
            state: 'school',
            short_label: 'ms',
            name: 'School',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-school'
          },
          {
            state: 'university',
            short_label: 'mu',
            name: 'University',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-university'
          },
          
          /*{
            state: 'semester',
            short_label: 'ms',
            name: 'Semester',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-semester'
          },
          {
            state: 'lesson',
            short_label: 'ml',
            name: 'Lesson',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-lesson'
          },
          {
            state: 'chapter',
            short_label: 'mc',
            name: 'Chapter',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-chapter'
          },
          {
            state: 'level',
            short_label: 'mu',
            name: 'Level',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-level'
          },
          {
            state: 'group',
            short_label: 'mg',
            name: 'Group',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-group'
          },*/
          {
            state: 'quiz',
            short_label: 'mq',
            name: 'Quiz',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-quiz'
          },
          {
            state: 'sub-quiz',
            short_label: 'msq',
            name: 'Sub Quiz',
            type: 'link',
            icon: 'ti-book',
            menukey:'view-subquiz'
          }
        ]
      },    
      // {
      //   state: 'basic',
      //   short_label: 'B',
      //   name: 'Basic Components',
      //   type: 'sub',
      //   icon: 'ti-layout-grid2-alt',
      //   menukey:'view-basic',
      //   children: [
      //     {
      //       state: 'button',
      //       name: 'Button'
      //     },
      //     {
      //       state: 'typography',
      //       name: 'Typography'
      //     }
      //   ]
      // },
      // {
      //   state: 'notifications',
      //   short_label: 'n',
      //   name: 'Notifications',
      //   type: 'link',
      //   icon: 'ti-crown',
      //   menukey:'view-notification'
      // },
      {
        state: 'apphome',
        short_label: 'AP',
        name: 'App Home Screen',
        type: 'link',
        icon: 'ti-files',
        menukey:'apphome'
      },
      {
        state: 'messaging',
        short_label: 'C',
        name: 'Chat Support',
        type: 'link',
        icon: 'ti-comment',
        menukey:'messaging'
      },
    ],
  }

];

@Injectable()
export class MenuItems {
  getAll(): Menu[] {
    return MENUITEMS;
  }

  /*add(menu: Menu) {
    MENUITEMS.push(menu);
  }*/
}
