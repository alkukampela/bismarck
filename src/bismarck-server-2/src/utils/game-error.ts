import { StatusCodes } from 'http-status-codes';
import { ErrorTypes } from '../types/error-types';

export class GameError extends Error {
  errorType: ErrorTypes;
  errorCode: string;

  constructor(errorType: ErrorTypes) {
    super(errorType);
    this.errorType = errorType;
    this.errorCode = this.getErrorCode();
  }

  private getErrorCode(): string {
    // Convert enum to stable error code
    return (
      Object.keys(ErrorTypes).find(
        (key) => ErrorTypes[key as keyof typeof ErrorTypes] === this.errorType
      ) || 'UNKNOWN_ERROR'
    );
  }

  getHttpStatusCode(): number {
    switch (this.errorType) {
      case ErrorTypes.NOT_FOUND:
      case ErrorTypes.GAME_NOT_FOUND:
        return StatusCodes.NOT_FOUND;

      case ErrorTypes.FORBIDDEN:
      case ErrorTypes.PLAYER_NOT_IN_GAME:
        return StatusCodes.FORBIDDEN;

      case ErrorTypes.MUST_BE_ELDEST_HAND:
      case ErrorTypes.NOT_TRICK_LEAD:
      case ErrorTypes.INVALID_GAME_ID:
      case ErrorTypes.ILLEGAL_CHOICE:
      case ErrorTypes.CARDS_MUST_BE_REMOVED:
      case ErrorTypes.NO_MORE_CARDS_TO_REMOVE:
      case ErrorTypes.GAME_TYPE_CHOSEN:
      case ErrorTypes.GAME_TYPE_NOT_CHOSEN:
      case ErrorTypes.MUST_FOLLOW_SUIT_AND_TRUMP:
      case ErrorTypes.OTHER_PLAYER_HAS_TURN:
      case ErrorTypes.CARD_ALREADY_PLAYED:
      case ErrorTypes.CARD_NOT_FOUND:
      case ErrorTypes.INVALID_QUERY_PARAMETERS:
        return StatusCodes.BAD_REQUEST;

      case ErrorTypes.TRICK_ALREADY_STARTED:
      case ErrorTypes.TRICK_NOT_STARTED:
      case ErrorTypes.CURRENT_HAND_NOT_FINISHED:
      case ErrorTypes.GAME_ENDED:
        return StatusCodes.CONFLICT;

      case ErrorTypes.UNEXPECTED_ERROR:
      default:
        return StatusCodes.INTERNAL_SERVER_ERROR;
    }
  }
}
