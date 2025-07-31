import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { INITIAL_EVENTS, createEventId } from "./event-utils";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import Swal from "sweetalert2";
import axios from "axios";

const Calendar = () => {
  const [event, setEvent] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleEvent = (e) => {
    setEvent(e);
  };

  const handleDeleteClick = (clickInfo) => {
    if (confirm("Do you want to delete it?")) {
      clickInfo.event.remove;
    }
  };

  const handleSelectedDate = async (selectInfo) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    const { value: formValues } = await Swal.fire({
      title: "Create Time Entry",
      html: `
      <input id="swal-title" class="swal2-input" placeholder="Title" />
      <input id="swal-comment" class="swal2-input" placeholder="Comment" />
      <select id="swal-status" class="swal2-input">
        <option value="Pending">Pending</option>
        <option value="Accepted">Accepted</option>
        <option value="Denied">Denied</option>
      </select>
    `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          title: document.getElementById("swal-title").value,
          hours: parseFloat(document.getElementById("swal-hours").value),
          comment: document.getElementById("swal-comment").value,
          status: document.getElementById("swal-status").value,
        };
      },
    });

    if (!formValues || !formValues.title) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5196/TimeRegistration",
        {
          date: selectInfo.startStr,
          hours: formValues.hours,
          comment: formValues.comment,
          status: formValues.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      calendarApi.addEvent({
        id: createEventId(),
        title: formValues.title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });

      Swal.fire("Success!", "Event registered!", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not create time entry", "error");
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      editable={true}
      selectable={true}
      dayMaxEvents={true}
      initialView="dayGridMonth"
      initialEvents={INITIAL_EVENTS}
      eventContent={renderEvent}
      eventClick={handleDeleteClick}
      eventsSet={handleEvent}
      select={handleSelectedDate}
    />
  );

  function renderEvent(eventContent) {
    return (
      <>
        <p>{eventContent.timeText}</p>
        <p>{eventContent.event.title}</p>
      </>
    );
  }
};

export default Calendar;
