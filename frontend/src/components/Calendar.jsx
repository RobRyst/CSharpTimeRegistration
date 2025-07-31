import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import Swal from "sweetalert2";
import axios from "axios";
import { INITIAL_EVENTS, createEventId } from "./event-utils";
import { getTimeRegistrations } from "../api/authAPI";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getTimeRegistrations();
        const data = response.data;

        const mappedEvents = data.map((entry) => ({
          id: entry.id,
          title: `${entry.comment} (${entry.hours}h)`,
          start: `${entry.date}T${entry.startTime}`,
          end: `${entry.date}T${entry.endTime}`,
          allDay: false,
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  /*
  const handleEvents = (e) => {
    setEvents(e);
  };
  */

  const handleDeleteClick = (clickInfo) => {
    if (confirm("Do you want to delete it?")) {
      clickInfo.event.remove();
    }
  };

  const handleSelectedDate = async (selectInfo) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    const { value: formValues } = await Swal.fire({
      title: "Create Time Entry",
      html: `
        <div style="text-align: left">
          <label for="swal-title">Title</label>
          <input id="swal-title" placeholder="Title" style="width: 100%; padding: 8px; margin-bottom: 10px;" />

          <label for="swal-comment">Comment</label>
          <input id="swal-comment" placeholder="Comment" style="width: 100%; padding: 8px; margin-bottom: 10px;" />

          <label for="swal-starttime">Start Time</label>
          <input id="swal-starttime" type="time" style="width: 100%; padding: 8px; margin-bottom: 10px;" />

          <label for="swal-endtime">End Time</label>
          <input id="swal-endtime" type="time" style="width: 100%; padding: 8px; margin-bottom: 10px;" />

          <label for="swal-status">Status</label>
          <select id="swal-status" style="width: 100%; padding: 8px;">
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Denied">Denied</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const startTimeRaw = document.getElementById("swal-starttime").value;
        const endTimeRaw = document.getElementById("swal-endtime").value;

        if (!startTimeRaw || !endTimeRaw) {
          Swal.showValidationMessage("Both start and end times are required");
          return;
        }

        const [startHour, startMinute] = startTimeRaw.split(":").map(Number);
        const [endHour, endMinute] = endTimeRaw.split(":").map(Number);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        const durationMinutes = endMinutes - startMinutes;

        if (durationMinutes <= 0) {
          Swal.showValidationMessage("End time must be after start time");
          return;
        }

        const hours = +(durationMinutes / 60).toFixed(2);

        return {
          title: document.getElementById("swal-title").value,
          startTime: `${startTimeRaw}:00`,
          endTime: `${endTimeRaw}:00`,
          hours: hours,
          comment: document.getElementById("swal-comment").value,
          status: document.getElementById("swal-status").value,
        };
      },
    });

    if (!formValues || !formValues.title) return;

    try {
      const token = localStorage.getItem("token");
      console.log("Using token:", token);

      await axios.post(
        "http://localhost:5196/TimeRegistration",
        {
          date: selectInfo.startStr,
          startTime: formValues.startTime,
          endTime: formValues.endTime,
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
        title: `${formValues.title} (${formValues.hours}h)`,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });

      setSuccess(true);
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
      events={events}
      //eventsSet={handleEvents}
      eventContent={renderEvent}
      eventClick={handleDeleteClick}
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
