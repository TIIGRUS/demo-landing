import { describe, it, expect } from "vitest"
import { validators, messages } from "../src/scripts/utils/validators"

describe('Email validator', () => {
    it('should return true for valid email', () => {
        expect(validators.email('test@example.com')).toBe(true)
    });

    it('should return false for invalid email', () => {
        expect(validators.email('invalid-email')).toBe(false)
    });

    it('should return false for empty string', () => {
        expect(validators.email('')).toBe(false)
    });

    it('should return false for email with spaces', () => {
        expect(validators.email('test @example.com')).toBe(false)
    });

    it('should return false for email without domain', () => {
        expect(validators.email('test@')).toBe(false)
    });

    it('should return false for email without username', () => {
        expect(validators.email('@example.com')).toBe(false)
    });

    it('should return false for email with multiple @', () => {
        expect(validators.email('test@@example.com')).toBe(false)
    });

    it('should return false for email without @', () => {
        expect(validators.email('testexample.com')).toBe(false)
    });
});

describe('Required validator', () => {
    it('should return true for non-empty string', () => {
        expect(validators.required('Hello')).toBe(true)
    });

    it('should return false for empty string', () => {
        expect(validators.required('')).toBe(false)
    });

    it('should return false for string with only spaces', () => {
        expect(validators.required("      ")).toBe(false)
    })
});

describe('Messages', () => {
    it('should have all required messages', () => {
        expect(messages.emailRequired).toBeDefined();
        expect(messages.emailInvalid).toBeDefined();
        expect(messages.submitError).toBeDefined();
        expect(messages.submitSuccess).toBeDefined();
        expect(messages.submitSuccessLog).toBeDefined();
    });

    it('should not have empty messages', () => {
        expect(messages.emailRequired).not.toBe('');
        expect(messages.emailInvalid).not.toBe('');
        expect(messages.submitError).not.toBe('');
        expect(messages.submitSuccess).not.toBe('');
        expect(messages.submitSuccessLog).not.toBe('');
    });
});
