# Nodex Framework

**Nodex** is a lightweight Node.js framework designed to accelerate development while adhering to best practices. With features such as email services, cron job management, powerful Mongoose queries, auth middleware, and utility functions, Nodex aims to streamline the development process while maintaining clean and scalable code.

## Features

### 📧 Email Service

Easily integrate email functionality into your application with Nodex's built-in email service. It supports popular providers like Gmail, SendGrid, and Mailgun, allowing you to send verification emails, notifications, and more.

- **Supports Multiple Email Providers**: Gmail, SendGrid, Mailgun, etc.
- **Customizable Templates**: You can easily set up email templates for different use cases.
- **Error Handling**: Built-in error handling ensures reliable email delivery.

### ⏱️ Cron Job Management

Manage recurring tasks effortlessly with Nodex's cron job support. Whether you're automating database cleanups, email notifications, or background tasks, Nodex provides a simple way to schedule and execute cron jobs.

- **Scheduled Jobs**: Easily define and schedule cron tasks for automation.
- **Retry Mechanism**: Nodex comes with a retry mechanism to handle failed cron tasks gracefully.

### 💾 Powerful Mongoose Queries

Nodex includes a powerful query builder for Mongoose, simplifying complex MongoDB queries. It's designed for flexibility and scalability, making it easier to perform advanced operations without repeating code.

- **Advanced Querying**: Support for filtering, sorting, pagination, and field limiting.
- **Pre-hooks**: Built-in hooks for pre-processing queries (e.g., filtering out soft-deleted documents).
- **Custom Queries**: Extendable query logic allows you to define reusable query patterns.

### 🔐 Authentication Middleware

Handle authentication with ease using Nodex's built-in auth middleware. It supports JWT-based authentication and provides helper functions for generating and verifying tokens.

- **JWT Authentication**: Generate and validate JWT tokens for secure authentication.
- **User Role Management**: Built-in support for managing user roles and permissions.
- **Token Expiry Handling**: Automatic handling of expired tokens with re-issue mechanisms.

### 🛠️ Utility Functions

Nodex provides a set of utility functions that simplify common tasks like hashing passwords, generating OTPs, formatting phone numbers, and more. These utilities are optimized for performance and ease of use.

- **Hashing and Password Management**: Hash and verify passwords securely using bcrypt.
- **OTP Generation**: Generate alphanumeric or numeric OTPs for secure authentication flows.
- **Phone Number Formatting**: Automatically format phone numbers to country-specific standards.
- **Error Handling**: Custom error classes and async error handlers to manage exceptions consistently.

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

```bash
npm install nodex
```
