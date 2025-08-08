import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import Swal from "sweetalert2";
import axios from "axios";
import { INITIAL_EVENTS, createEventId } from "./event-utils";
import {
  GetTimeRegistrationsForUser,
  deleteTimeRegistration,
  GetAllProjects,
} from "../api/authAPI";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing token");

        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles =
          payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        const isAdmin = Array.isArray(roles)
          ? roles.includes("Admin")
          : roles === "Admin";

        const response = isAdmin
          ? await axios.get("http://localhost:5196/TimeRegistration/all", {
              headers: { Authorization: `Bearer ${token}` },
            })
          : await GetTimeRegistrationsForUser();

        const data = response.data;

        const mappedEvents = data.map((entry) => {
          const dateStr = entry.date.split("T")[0];
          return {
            id: entry.id,
            title: `${entry.comment} (${entry.hours}h)`,
            start: `${dateStr}T${entry.startTime}`,
            end: `${dateStr}T${entry.endTime}`,
            allDay: false,
          };
        });

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await GetAllProjects();
        console.log("Fetched Projects:", res.data);
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };

    fetchEvents();
    fetchProjects();
  }, []);

  const handleDeleteClick = async (clickInfo) => {
    const confirmed = confirm("Do you want to delete this task?");
    if (!confirmed) return;

    const id = clickInfo.event.id;

    try {
      await deleteTimeRegistration(id);
      clickInfo.event.remove();
      Swal.fire("Deleted!", "Your task has been removed.", "success");
    } catch (err) {
      console.error("Failed to delete:", err);
      Swal.fire("Error", "Could not delete time entry", "error");
    }
  };

  const handleSelectedDate = async (selectInfo) => {
    const selectedDate = new Date(selectInfo.startStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - 30);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (selectedDate < minDate || selectedDate > maxDate) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Date",
        text: `You can only create events within 30 days before or after today.`,
      });
      return;
    }

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    const { value: formValues } = await Swal.fire({
      title: "Create Event",
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
          <select id="swal-status" style="width: 100%; padding: 8px; margin-bottom: 10px;">
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Denied">Denied</option>
          </select>

          <label for="swal-project">Project</label>
          <select id="swal-project" style="width: 100%; padding: 8px;">
            ${projects
              .map((p) => `<option value="${p.id}">${p.name}</option>`)
              .join("")}
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
          projectId: parseInt(document.getElementById("swal-project").value),
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
          startTime: formValues.startTime,
          endTime: formValues.endTime,
          hours: formValues.hours,
          comment: formValues.comment,
          status: formValues.status,
          projectId: formValues.projectId,
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

  function renderEvent(eventContent) {
    return (
      <>
        <p>{eventContent.timeText}</p>
        <p>{eventContent.event.title}</p>
      </>
    );
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      editable={true}
      selectable={true}
      dayMaxEvents={true}
      initialView="dayGridMonth"
      events={events}
      eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }}
      eventContent={renderEvent}
      eventClick={handleDeleteClick}
      select={handleSelectedDate}
    />
  );
};

export default Calendar;
