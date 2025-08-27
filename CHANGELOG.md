# Changelog

## [0.0.7] - 2025-08-27

### Added

#### Literal Schema Type

- **New `y.literal()` schema validator** for exact value matching
- Supports string, number, and boolean literal values
- Perfect for discriminant keys and constant values
- Includes full nullability and optionality support

**Example:**

```typescript
import { y } from "syncrostate";

// Create literal validators
const statusSuccess = y.literal("success");
const statusError = y.literal("error");
const maxRetries = y.literal(3);
const isEnabled = y.literal(true);

// Usage in validation
statusSuccess.isValid("success"); // true
statusSuccess.isValid("error"); // false
maxRetries.isValid(3); // true
maxRetries.isValid(5); // false
```

#### Discriminated Union Schema Type

- **New `y.discriminatedUnion()` schema validator** for type-safe union types
- Automatically switches between object variants based on discriminant key
- Full reactive support with automatic variant swapping
- Seamless integration with Yjs for collaborative editing

**Example:**

```typescript
import { y, syncroState } from "syncrostate";

// Define API response types
const apiResponse = y.discriminatedUnion("status", [
  y.object({
    status: y.literal("success"),
    data: y.string(),
    timestamp: y.number(),
  }),
  y.object({
    status: y.literal("error"),
    message: y.string(),
    code: y.number(),
  }),
  y.object({
    status: y.literal("loading"),
    progress: y.number(),
  }),
]);

// Use in reactive state
const response = syncroState(apiResponse, {
  status: "loading",
  progress: 0,
});

// Type-safe updates - automatically switches variants
response.value = {
  status: "success",
  data: "Hello World",
  timestamp: Date.now(),
};

// TypeScript knows the exact shape based on discriminant
if (response.value.status === "success") {
  console.log(response.value.data); // ✅ TypeScript knows this exists
  // console.log(response.value.message); // ❌ TypeScript error
}
```

**Advanced Example - User Permissions:**

```typescript
const userPermission = y.discriminatedUnion("role", [
  y.object({
    role: y.literal("admin"),
    permissions: y.array(y.string()),
    canDeleteUsers: y.boolean(),
  }),
  y.object({
    role: y.literal("user"),
    permissions: y.array(y.string()),
  }),
  y.object({
    role: y.literal("guest"),
    expiresAt: y.date(),
  }),
]);

const user = syncroState(userPermission, {
  role: "guest",
  expiresAt: new Date(),
});

// Upgrade user to admin
user.value = {
  role: "admin",
  permissions: ["read", "write", "delete"],
  canDeleteUsers: true,
};
```

### Features

- Both literal and discriminated union types support `.optional()` and `.nullable()` modifiers
- Full TypeScript type inference and safety
- Seamless integration with existing syncrostate reactive system
- Automatic Yjs synchronization for collaborative applications
- Comprehensive validation and coercion support

### Technical Details

- Discriminated unions automatically detect variant changes and swap underlying object validators
- Literal validators provide exact value matching with efficient comparison
- Both types integrate with the existing proxy system for reactive updates
- Full test coverage for all new functionality

## [0.0.6] - Previous Release

- Previous features and improvements undocumented
