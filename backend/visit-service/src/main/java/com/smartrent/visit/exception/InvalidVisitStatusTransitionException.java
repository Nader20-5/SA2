package com.smartrent.visit.exception;

public class InvalidVisitStatusTransitionException extends RuntimeException {
    public InvalidVisitStatusTransitionException(String message) { super(message); }
}
