import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import {
  CalendarEvent,
  CalendarDateFormatter,
  CalendarEventTitleFormatter
} from "angular-calendar";
import { subDays, addDays } from "date-fns";
import {
  isSameMonth,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format
} from "date-fns";
import { Observable, of } from "rxjs";
import { colors } from "./utils/colors";
import { CustomDateFormatter } from "./providers/custom-date-formatter.provider";
import { CustomEventTitleFormatter } from "./providers/custom-event-title-formatter.provider";

interface Film {
  id: number;
  title: string;
  release_date: string;
}

const timezoneOffset = new Date().getTimezoneOffset();
const hoursOffset = String(Math.floor(Math.abs(timezoneOffset / 60))).padStart(
  2,
  "0"
);
const minutesOffset = String(Math.abs(timezoneOffset % 60)).padEnd(2, "0");
const direction = timezoneOffset > 0 ? "-" : "+";
const timezoneOffsetString = `T00:00:00${direction}${hoursOffset}${minutesOffset}`;

@Component({
  selector: "app-root",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  /**
   * Saját CalendarDateFormatter használata:
   */
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    },
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]
})
export class AppComponent implements OnInit {
  view: string = "month";

  /**
   * Magyar nyelv:
   */
  locale: string = "hu";

  /**
   * Speciális hosszúságú hét:
   */
  excludeDays: number[] = [0, 6];

  /**
   * Napi nézetben a hétvégi napok kihagyása:
   * @param direction
   */
  skipWeekends(direction: "back" | "forward"): void {
    if (this.view === "day") {
      if (direction === "back") {
        while (this.excludeDays.indexOf(this.viewDate.getDay()) > -1) {
          this.viewDate = subDays(this.viewDate, 1);
        }
      } else if (direction === "forward") {
        while (this.excludeDays.indexOf(this.viewDate.getDay()) > -1) {
          this.viewDate = addDays(this.viewDate, 1);
        }
      }
    }
  }

  //-------

  viewDate: Date = new Date();

  events$: Observable<Array<CalendarEvent<{ film: Film }>>>;

  ownEvents$: Observable<Array<CalendarEvent<{ film: Film }>>>;

  ownCalendarEvents: CalendarEvent[];

  activeDayIsOpen: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents(): void {
    const getStart: any = {
      month: startOfMonth,
      week: startOfWeek,
      day: startOfDay
    }[this.view];

    const getEnd: any = {
      month: endOfMonth,
      week: endOfWeek,
      day: endOfDay
    }[this.view];

    const params = new HttpParams()
      .set(
        "primary_release_date.gte",
        format(getStart(this.viewDate), "YYYY-MM-DD")
      )
      .set(
        "primary_release_date.lte",
        format(getEnd(this.viewDate), "YYYY-MM-DD")
      )
      .set("api_key", "0ec33936a68018857d727958dca1424f");

    this.events$ = this.http
      .get("https://api.themoviedb.org/3/discover/movie", { params })
      .pipe(
        map(({ results }: { results: Film[] }) => {
          return results.map((film: Film) => {
            return {
              title: film.title,
              start: new Date(film.release_date + timezoneOffsetString),
              color: colors.yellow,
              meta: {
                film
              }
            };
          });
        })
      );

    this.events$.subscribe(res => {
      console.log(res);
    });

    this.ownEvents$ = of([
      {
        title: "TESZT",
        start: new Date("2018-10-15"),
        color: colors.yellow
      },
      {
        title: "TESZT2",
        start: new Date("2018-10-15 12:00"),
        end: new Date("2018-10-15 13:00"),
        color: colors.yellow
      }
    ]);

    this.ownCalendarEvents = [
      {
        title: "TEST CALENDAR EVENT 1",
        start: new Date("2018-10-15"),
        color: colors.yellow,
        actions: [
          {
            label: '<i class="fa fa-fw fa-pencil"></i>',
            onClick: ({ event }: { event: CalendarEvent }): void => {
              console.log("Edit event", event);
            }
          }
        ]
      },
      {
        title: "TEST CALENDAR EVENT 2",
        start: new Date("2018-10-15 12:00"),
        end: new Date("2018-10-15 13:00"),
        color: colors.yellow,
        actions: [
          {
            label: '<i class="fa fa-fw fa-times"></i>',
            onClick: ({ event }: { event: CalendarEvent }): void => {
              this.ownCalendarEvents = this.ownCalendarEvents.filter(
                iEvent => iEvent !== event
              );
              console.log("Event deleted", event);
            }
          }
        ]
      }
    ];
  }

  dayClicked({
    date,
    events
  }: {
    date: Date;
    events: Array<CalendarEvent<{ film: Film }>>;
  }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventClicked(event: CalendarEvent<{ film: Film }>): void {
    window.open(
      `https://www.themoviedb.org/movie/${event.meta.film.id}`,
      "_blank"
    );
  }
}
