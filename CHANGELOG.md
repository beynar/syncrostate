# Changelog

## [0.0.8] - 2025-08-27

### Fixed

#### Array Splice Method Critical Bug Fixes

- **Fixed "Length exceeded!" error** in array splice operations that occurred when Y.js delete was called multiple times inside loops
- **Fixed empty array handling** - Setting arrays to `[]` no longer returns `null`, properly maintains empty array state
- **Fixed Y.js document synchronization** - Array operations now properly sync between Svelte5 $state and Y.js document
- **Added comprehensive bounds validation** for array splice method to prevent crashes and ensure native JavaScript Array compatibility

#### Array Splice Bounds Validation

- **Negative start indices** - Now properly handles negative indices like native `Array.splice()` (e.g., `-1` refers to last element)
- **Start index beyond array length** - Safely clamps to array bounds instead of causing errors
- **Excessive deleteCount** - Prevents attempting to delete more items than available
- **Negative deleteCount** - Treats negative values as 0 (no deletion) matching native behavior
- **Edge case handling** - Robust handling of empty arrays, single elements, and boundary violations

#### Array Schema Coercion Fix

- **Fixed empty array coercion** - Empty arrays `[]` are now properly coerced and maintained instead of being converted to `null`

### Technical Improvements

- **Enhanced test coverage** with comprehensive diagnostic and bounds validation test suites
- **Improved error handling** - Array operations no longer throw "Length exceeded!" errors under any circumstances  
- **Better Y.js integration** - Proper synchronization between proxy arrays and underlying Y.js documents
- **Memory optimization** - Fixed state cleanup order in splice operations to prevent memory spikes

### Breaking Changes

None - All fixes maintain backward compatibility while resolving critical synchronization bugs.

---

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
