export interface TimeData {
    seconds: number;
    timeInit: number;
    panicMode: boolean;
    pause: boolean;
}

export const TIME_DATA: TimeData = {
    seconds: 0,
    timeInit: 0,
    panicMode: false,
    pause: false,
};
