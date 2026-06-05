export type ApiErrorDetails = Record<string, string[]> | string[] | string;

export type ApiClientErrorKind = "network" | "response";

type ApiClientErrorOptions = {
  kind: ApiClientErrorKind;
  message: string;
  statusCode?: number;
  serverMessage?: string;
  serverErrors?: ApiErrorDetails;
};

export class ApiClientError extends Error {
  kind: ApiClientErrorKind;
  statusCode?: number;
  serverMessage?: string;
  serverErrors?: ApiErrorDetails;

  constructor({
    kind,
    message,
    statusCode,
    serverMessage,
    serverErrors
  }: ApiClientErrorOptions) {
    super(message);
    this.name = "ApiClientError";
    this.kind = kind;
    this.statusCode = statusCode;
    this.serverMessage = serverMessage;
    this.serverErrors = serverErrors;
  }
}
