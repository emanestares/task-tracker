package com.tasktracker.exception;

import java.util.Map;

public class FieldValidationException extends RuntimeException {
  private final Map<String, String> fields;

  public FieldValidationException(Map<String, String> fields) {
    super("Validation failed");
    this.fields = fields;
  }

  public Map<String, String> getFields() {
    return fields;
  }
}
