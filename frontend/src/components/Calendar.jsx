import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { INITIAL_EVENTS, createEventId } from "./event-utils";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

const Calendar = () => {
  const [event, setEvent] = useState([]);

  const handleEvent = (e) => {
    setEvent(e);
  };

  const handleDeleteClick = (clickInfo) => {
    if (confirm("Do you want to delete it?")) {
      clickInfo.event.remove;
    }
  };

  const handleSelectedDate = (selectInfo) => {
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    calendarApi.addEvent({
      id: createEventId(),
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
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
