interface BaseResult {
    ok: boolean;
}

interface SuccessResult<T> extends BaseResult {
    ok: true;
    value: T;
}

interface FailureResult extends BaseResult {
    ok: false;
    error: string;
}

export type Result<T> = SuccessResult<T> | FailureResult;
