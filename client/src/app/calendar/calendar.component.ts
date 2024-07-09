import { Component, Input, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf'; // Import jsPDF
import autoTable from 'jspdf-autotable'; // Import autoTable plugin

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @Input() email: string | null = null;
  calendarOptions: any;
  events: any[] = [];
  showCreatePopup: boolean = false;
  showViewPopup: boolean = false;
  newEventTitle: string = '';
  newEventDate: string = '';
  newEventTime: string = '';
  newEventPeople: string = '';
  newEventDescription: string = '';
  currentEvent: any = null;

  private apiUrl = 'http://localhost:5000/api/events';
   private chatApiUrl = 'http://localhost:5000/api/chat'; 

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadEvents();
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin],
      events: this.events,
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventContent: this.renderEventContent.bind(this)
    };
  }

  async loadEvents() {
    if (this.email) {
      try {
        const response = await fetch(`${this.apiUrl}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email })
        });
        this.events = await response.json();
        this.events = this.events.map(event => ({
          ...event,
          title: event.name
        }));
        this.calendarOptions.events = this.events;
      } catch (error) {
        console.error('Error loading events:', error);
      }
    }
  }

  renderEventContent(eventInfo: any) {
    return { html: `<div class="event-title">${eventInfo.event.title}</div>` };
  }

  handleDateClick(arg: any) {
    this.newEventDate = arg.dateStr;
    this.openCreatePopup();
  }

  handleEventClick(arg: any) {
    console.log('Event clicked:', arg.event);
    this.currentEvent = this.events.find(event => event.name === arg.event.title);
    if (this.currentEvent) {
      console.log('Opening view popup for event:', this.currentEvent);
      this.openViewPopup();
    } else {
      console.log('Event not found:', arg.event.title);
    }
  }

  startMeeting() {
    if (this.currentEvent) {
      const meetingName = this.currentEvent.name;
      const meetingId = Math.random().toString(36).substring(2, 7);
      this.router.navigate([`/meet/${meetingName}/${meetingId}`]);
    }
  }

  openCreatePopup() {
    console.log('openCreatePopup called');
    this.showCreatePopup = true;
  }

  closeCreatePopup() {
    this.showCreatePopup = false;
    this.newEventTitle = '';
    this.newEventDate = '';
    this.newEventTime = '';
    this.newEventPeople = '';
    this.newEventDescription = '';
  }

  async createEvent() {
    if (this.newEventTitle && this.newEventDate && this.newEventTime && this.email) {
      const newEvent = {
        email: this.email,
        name: this.newEventTitle,
        date: this.newEventDate,
        time: this.newEventTime,
        people: this.newEventPeople,
        description: this.newEventDescription
      };
      try {
        const response = await fetch(`${this.apiUrl}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent)
        });
        const data = await response.json();
        data.title = data.name;
        this.events = [...this.events, data];
        this.calendarOptions.events = this.events;
        this.closeCreatePopup();
      } catch (error) {
        console.error('Error creating event:', error);
      }
    }
  }

  openViewPopup() {
    console.log('openViewPopup called');
    this.showViewPopup = true;
  }

  closeViewPopup() {
    this.showViewPopup = false;
    this.currentEvent = null;
  }

  async updateEvent() {
    if (this.currentEvent && this.email) {
      const updatePayload = {
        email: this.email,
        name: this.currentEvent.name,
        date: this.currentEvent.date,
        time: this.currentEvent.time,
        people: this.currentEvent.people,
        description: this.currentEvent.description
      };

      try {
        const response = await fetch(`${this.apiUrl}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });
        const updatedEvent = await response.json();
        const index = this.events.findIndex(event => event._id === this.currentEvent._id);
        if (index !== -1) {
          updatedEvent.title = updatedEvent.name;
          this.events[index] = updatedEvent;
          this.calendarOptions.events = this.events;
        }
        this.closeViewPopup();
      } catch (error) {
        console.error('Error updating event:', error);
      }
    }
  }

  async deleteEvent() {
    if (this.currentEvent && this.email) {
      try {
        await fetch(`${this.apiUrl}/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, name: this.currentEvent.name })
        });
        this.events = this.events.filter(event => event._id !== this.currentEvent._id);
        this.calendarOptions.events = this.events;
        this.closeViewPopup();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  }

  handleInputChange(event: Event, field: 'newEventTitle' | 'newEventDate' | 'newEventTime' | 'newEventPeople' | 'newEventDescription') {
    const inputElement = event.target as HTMLInputElement;
    this[field] = inputElement.value;
  }

  handleCurrentEventInputChange(event: Event, field: 'date' | 'time' | 'people' | 'description') {
    const inputElement = event.target as HTMLInputElement;
    if (this.currentEvent) {
      this.currentEvent[field] = inputElement.value;
    }
  }
  async downloadEventChats() {
    if (!this.currentEvent) return;

    const { name, email, date, time, people, description } = this.currentEvent;

    try {
      const response = await fetch(`${this.chatApiUrl}/viewpdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await response.json();

      // Generate PDF
      const doc = new jsPDF();

      // Add title and event details
      doc.setFontSize(18);
      doc.text(`${name}`, 10, 10);
      doc.setFontSize(12);
      doc.text(`Email: ${email}`, 10, 20);
      doc.text(`Date: ${date}`, 10, 30);
      doc.text(`Time: ${time}`, 10, 40);
      doc.text(`People: ${people}`, 10, 50);
      doc.text(`Description: ${description}`, 10, 60);

      // Add chats
      data.forEach((chat: any) => {
        doc.addPage();
        doc.text(`Meeting ID: ${chat.meetingId}`, 10, 10);
        autoTable(doc, {
          startY: 20,
          head: [['Sender Email', 'Message', 'Timestamp']],
          body: chat.messages.map((msg: any) => [msg.senderEmail, msg.message, new Date(msg.timestamp).toLocaleString()])
        });
      });

      // Save PDF
      doc.save(`${name}_event_chats.pdf`);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  }
}
