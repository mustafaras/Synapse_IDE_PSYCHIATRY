

export const PHQ9_JSON_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.org/psychiatry/phq9.schema.json",
  "title": "PHQ-9 Responses",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "q1": { "type": "integer", "minimum": 0, "maximum": 3 },
    "q2": { "type": "integer", "minimum": 0, "maximum": 3 },
    "q3": { "type": "integer", "minimum": 0, "maximum": 3 },
    "q4": { "type": "integer", "minimum": 0, "maximum": 3 },
    "q5": { "type": "integer", "minimum": 0, "maximum": 3 },
    "q6": { "type": "integer", "minimum": 0, "maximum": 3 },
    "q7": { "type": "integer", "minimum": 0, "maximum": 3 },
    "q8": { "type": "integer", "minimum": 0, "maximum": 3 },
    "q9": { "type": "integer", "minimum": 0, "maximum": 3 }
  },
  "required": ["q1","q2","q3","q4","q5","q6","q7","q8","q9"]
};
