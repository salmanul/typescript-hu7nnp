import { timer, interval, from, Observable } from 'rxjs';
import {
  map,
  tap,
  retryWhen,
  delayWhen,
  switchMap,
  takeUntil,
  filter,
  take,
  delay,
} from 'rxjs/operators';

//emit value every 1s
// const source = interval(1000);
const getPromise = () =>
  new Promise((res, rej) => {
    res(Math.random());
  });

const requestData = () =>
  from(getPromise()).pipe(
    map((val: number) => val * 10),
    tap((val) => console.log('Request Data:', val))
  );

const startPolling = (interval: number) => {
  return timer(0, interval).pipe(switchMap((_) => requestData()));
};

const example = startPolling(1000).pipe(
  map((val) => {
    if (val > 5) {
      //error will be picked up by retryWhen
      throw val;
    }
    return val;
  }),
  retryWhen((errors) =>
    errors.pipe(
      //log error message
      tap((val) => console.log(`Value ${val} was too high!`)),
      //restart in 5 seconds
      // delayWhen( _ => timer(1000))
      delay(1000)
    )
  ),
  take(1)
);
/*
  output:
  0
  1
  2
  3
  4
  5
  "Value 6 was too high!"
  --Wait 5 seconds then repeat
*/
const subscribe = example.subscribe((val) => console.log(val));
