import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';


@Component({
  selector: 'app-messages-chat',
  templateUrl: './messages-chat.component.html',
  styleUrls: ['./messages-chat.component.scss']
})
export class MessagesChatComponent implements OnInit {
  conversations: any[];
  message: any
  messages: any[] = []
  user_id: any
  selectedConversation: any;
  conversationHeading: any;
  search: any = ''
  constructor(private userService: UserService) { }

  ngOnInit() {
    let userData = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = userData['user'][0].id
    this.getRequestList()
  }

  getRequestList() {
    this.userService.viewRequestList().subscribe((res: any) => {
      console.log(res)
      this.conversations = res.data
    })
  }

  checkAttachmentAndSendMessage() {
    let obj = {
      sender_id: this.user_id,
      receiver_id: this.selectedConversation,
      message: this.message,
      date: new Date(Date.now())
    }
    this.userService.sendMessage(obj).subscribe((res: any) => {
      // console.log(res)
      if (res.status == 200) {
        this.messages.push(obj);
        this.message = ""
      } else {

      }
    })
  }
  viewConversations(data) {
    this.conversationHeading = data.first_name + " " + data.last_name;
    this.selectedConversation = data.id
    let obj = {
      "sender_id": data.id,
      "receiver_id": this.user_id
    }
    this.userService.seenMessages(obj).subscribe((res: any) => {
      // console.log(res)
      // this.readMessage(data.id)
      // this.getRequestList()
      this.messages = res.data;
    })
  }

  readMessage(id) {
    this.userService.readMessage(id, {}).subscribe((res: any) => {
      console.log(res.msg)
    })
  }

  searchUser(text) {
    if (this.search == '') {
      this.getRequestList()
    } else {
      var foundValue = this.conversations.filter(obj => obj.first_name.includes(text));
      this.conversations = foundValue;
    }
  }
}
