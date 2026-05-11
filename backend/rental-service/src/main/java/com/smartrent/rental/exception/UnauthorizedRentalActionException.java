package com.smartrent.rental.exception;

public class UnauthorizedRentalActionException extends RuntimeException {
    public UnauthorizedRentalActionException(String message) { super(message); }
}
