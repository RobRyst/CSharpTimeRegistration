import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";

const Homepage = () => {
  return (
    <>
      <h1>HELLO, THIS IS CALENDAR</h1>
      <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" />
    </>
  );
};

export default Homepage;
