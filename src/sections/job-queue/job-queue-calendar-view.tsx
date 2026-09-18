'use client';

import type { DatesSetArg, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import type { IJobQueue } from 'src/types/job-queue';

import dayjs from 'dayjs';
import listPlugin from '@fullcalendar/list';
import { RiAddLine } from '@remixicon/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useRef, useState, useEffect } from 'react';
import thLocale from '@fullcalendar/core/locales/th';
import interactionPlugin from '@fullcalendar/interaction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';

import { useJobsQuery } from './job-queue-queries';
import { JOB_QUEUE_STATUS_META, JOB_QUEUE_STATUS_OPTIONS } from './job-queue-status';

// ----------------------------------------------------------------------

function jobToEvent(job: IJobQueue) {
  const start = job.startTime ? `${job.jobDate}T${job.startTime}` : job.jobDate;
  const end = job.endTime ? `${job.jobDate}T${job.endTime}` : undefined;

  return {
    id: job.id,
    title: `${job.title || 'คิวงาน'} — ${job.customer?.name ?? ''}`,
    start,
    end,
    allDay: !job.startTime,
    backgroundColor: JOB_QUEUE_STATUS_META[job.status].hex,
    borderColor: JOB_QUEUE_STATUS_META[job.status].hex,
    extendedProps: { job },
  };
}

export function JobQueueCalendarView() {
  const theme = useTheme();
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);

  const [range, setRange] = useState(() => ({
    dateFrom: dayjs().startOf('month').format('YYYY-MM-DD'),
    dateTo: dayjs().endOf('month').format('YYYY-MM-DD'),
  }));

  const { data: jobs = [], isError } = useJobsQuery(range);

  useEffect(() => {
    if (isError) toast.error('โหลดข้อมูลคิวงานไม่สำเร็จ');
  }, [isError]);

  const handleDatesSet = (arg: DatesSetArg) => {
    setRange({
      dateFrom: dayjs(arg.start).format('YYYY-MM-DD'),
      dateTo: dayjs(arg.end).format('YYYY-MM-DD'),
    });
  };

  const handleDateClick = (arg: DateSelectArg) => {
    router.push(`${paths.dashboard.jobQueue.new}?date=${arg.startStr}`);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const job = arg.event.extendedProps.job as IJobQueue;
    router.push(paths.dashboard.jobQueue.details(job.id));
  };

  const handleNewClick = () => {
    router.push(paths.dashboard.jobQueue.new);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          mb: 3,
          gap: 2,
          display: 'flex',
          alignItems: { sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4">ลงคิวงาน</Typography>

        <Box sx={{ gap: 1, display: 'flex', width: { xs: 1, sm: 'auto' } }}>
          <Button variant="outlined" onClick={() => router.push(paths.dashboard.jobQueue.display)}>
            มุมมองคิวงาน
          </Button>
          <Button variant="contained" startIcon={<RiAddLine />} onClick={handleNewClick}>
            ลงคิวงานใหม่
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3, gap: 1, display: 'flex', flexWrap: 'wrap' }}>
        {JOB_QUEUE_STATUS_OPTIONS.map((option) => (
          <Label
            key={option.value}
            variant="soft"
            color={JOB_QUEUE_STATUS_META[option.value].color}
          >
            {option.label}
          </Label>
        ))}
      </Box>

      <Card sx={{ p: { xs: 1, sm: 2 } }}>
        <Box
          sx={{
            '.fc': { fontFamily: theme.typography.fontFamily },
            '.fc .fc-toolbar-title': { fontSize: '1.05rem', fontWeight: 700 },
            '.fc .fc-button': {
              textTransform: 'capitalize',
              backgroundColor: 'transparent',
              borderColor: theme.vars.palette.divider,
              color: theme.vars.palette.text.primary,
              boxShadow: 'none',
            },
            '.fc .fc-button:hover': { backgroundColor: theme.vars.palette.action.hover },
            '.fc .fc-button-active': {
              backgroundColor: `${theme.vars.palette.primary.main} !important`,
              borderColor: `${theme.vars.palette.primary.main} !important`,
              color: `${theme.vars.palette.primary.contrastText} !important`,
            },
            '.fc-daygrid-day.fc-day-today, .fc-timegrid-col.fc-day-today': {
              backgroundColor: theme.vars.palette.action.selected,
            },
            '.fc-event': { cursor: 'pointer', border: 'none', padding: '2px 4px' },
            '.fc-theme-standard td, .fc-theme-standard th, .fc-theme-standard .fc-scrollgrid': {
              borderColor: theme.vars.palette.divider,
            },
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listWeek',
            }}
            locale={thLocale}
            height="auto"
            selectable
            dayMaxEvents={3}
            events={jobs.map(jobToEvent)}
            select={handleDateClick}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
          />
        </Box>
      </Card>
    </DashboardContent>
  );
}
