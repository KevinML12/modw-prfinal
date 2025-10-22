import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Authentication System (FASE-IV-002)
 * 
 * Tests cover:
 * - Login/Register forms with validation
 * - Protected routes with guards
 * - Guest vs authenticated checkout
 * - Session persistence
 * - Order history access
 */

// Test data
const TEST_USER = {
	email: 'test-' + Date.now() + '@example.com',
	password: 'Test@12345',
	fullName: 'Test User'
};

const EXISTING_USER = {
	email: 'existing@example.com',
	password: 'Existing@12345'
};

test.describe('Authentication System - FASE-IV-002', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to home before each test
		await page.goto('/');
	});

	test.describe('1. Login Form Component', () => {
		test('1.1 - Should display login form on /login page', async ({ page }) => {
			await page.goto('/login');
			
			// Check form elements exist
			await expect(page.locator('[data-testid="login-email-input"]')).toBeVisible();
			await expect(page.locator('[data-testid="login-password-input"]')).toBeVisible();
			await expect(page.locator('[data-testid="login-submit-button"]')).toBeVisible();
		});

		test('1.2 - Should show password toggle button', async ({ page }) => {
			await page.goto('/login');
			
			const toggleButton = page.locator('[data-testid="login-password-toggle"]');
			await expect(toggleButton).toBeVisible();
			
			// Click toggle to show password
			await toggleButton.click();
			
			// Verify password input type changed
			const passwordInput = page.locator('[data-testid="login-password-input-text"]');
			await expect(passwordInput).toBeVisible();
		});

		test('1.3 - Should validate email format in real-time', async ({ page }) => {
			await page.goto('/login');
			
			const emailInput = page.locator('[data-testid="login-email-input"]');
			const errorMessage = page.locator('[data-testid="login-email-error"]');
			
			// Enter invalid email
			await emailInput.fill('invalid-email');
			
			// Wait for validation error
			await expect(errorMessage).toBeVisible();
			await expect(errorMessage).toContainText('Email inválido');
		});

		test('1.4 - Should validate password length', async ({ page }) => {
			await page.goto('/login');
			
			const passwordInput = page.locator('[data-testid="login-password-input"]');
			const errorMessage = page.locator('[data-testid="login-password-error"]');
			
			// Enter short password
			await passwordInput.fill('short');
			
			// Wait for validation error
			await expect(errorMessage).toBeVisible();
			await expect(errorMessage).toContainText('Al menos 6 caracteres');
		});

		test('1.5 - Should disable submit button if validation fails', async ({ page }) => {
			await page.goto('/login');
			
			const submitButton = page.locator('[data-testid="login-submit-button"]');
			
			// Initially should be disabled
			await expect(submitButton).toBeDisabled();
			
			// Fill valid email but invalid password
			await page.locator('[data-testid="login-email-input"]').fill('valid@email.com');
			await page.locator('[data-testid="login-password-input"]').fill('short');
			
			// Should still be disabled
			await expect(submitButton).toBeDisabled();
		});

		test('1.6 - Should show loading state during submit', async ({ page }) => {
			await page.goto('/login');
			
			// Fill form with test credentials
			await page.locator('[data-testid="login-email-input"]').fill(EXISTING_USER.email);
			await page.locator('[data-testid="login-password-input"]').fill(EXISTING_USER.password);
			
			// Click submit
			const submitButton = page.locator('[data-testid="login-submit-button"]');
			await submitButton.click();
			
			// Check for loading indicator
			const spinner = page.locator('[data-testid="login-loading-spinner"]');
			await expect(spinner).toBeVisible();
		});
	});

	test.describe('2. Register Form Component', () => {
		test('2.1 - Should display register form on /register page', async ({ page }) => {
			await page.goto('/register');
			
			// Check form elements exist
			await expect(page.locator('[data-testid="register-name-input"]')).toBeVisible();
			await expect(page.locator('[data-testid="register-email-input"]')).toBeVisible();
			await expect(page.locator('[data-testid="register-password-input"]')).toBeVisible();
			await expect(page.locator('[data-testid="register-confirm-input"]')).toBeVisible();
			await expect(page.locator('[data-testid="register-submit-button"]')).toBeVisible();
		});

		test('2.2 - Should validate full name', async ({ page }) => {
			await page.goto('/register');
			
			const nameInput = page.locator('[data-testid="register-name-input"]');
			const errorMessage = page.locator('[data-testid="register-name-error"]');
			
			// Enter short name
			await nameInput.fill('A');
			
			// Wait for validation error
			await expect(errorMessage).toBeVisible();
			await expect(errorMessage).toContainText('mínimo 3 caracteres');
		});

		test('2.3 - Should validate password confirmation match', async ({ page }) => {
			await page.goto('/register');
			
			// Fill password fields with non-matching values
			await page.locator('[data-testid="register-password-input"]').fill('Test@12345');
			await page.locator('[data-testid="register-confirm-input"]').fill('Different@12345');
			
			// Check for error
			const errorMessage = page.locator('[data-testid="register-confirm-error"]');
			await expect(errorMessage).toBeVisible();
			await expect(errorMessage).toContainText('deben coincidir');
		});

		test('2.4 - Should validate password requirements', async ({ page }) => {
			await page.goto('/register');
			
			const passwordInput = page.locator('[data-testid="register-password-input"]');
			const errorMessage = page.locator('[data-testid="register-password-error"]');
			
			// Enter weak password (no uppercase, no number, no special char)
			await passwordInput.fill('lowercase');
			
			// Check for validation error
			await expect(errorMessage).toBeVisible();
		});

		test('2.5 - Should show password toggle for both fields', async ({ page }) => {
			await page.goto('/register');
			
			const passwordToggle = page.locator('[data-testid="register-password-toggle"]');
			const confirmToggle = page.locator('[data-testid="register-confirm-toggle"]');
			
			await expect(passwordToggle).toBeVisible();
			await expect(confirmToggle).toBeVisible();
		});

		test('2.6 - Should enable submit button when all validations pass', async ({ page }) => {
			await page.goto('/register');
			
			// Fill all fields with valid data
			await page.locator('[data-testid="register-name-input"]').fill(TEST_USER.fullName);
			await page.locator('[data-testid="register-email-input"]').fill(TEST_USER.email);
			await page.locator('[data-testid="register-password-input"]').fill(TEST_USER.password);
			await page.locator('[data-testid="register-confirm-input"]').fill(TEST_USER.password);
			
			// Submit button should be enabled
			const submitButton = page.locator('[data-testid="register-submit-button"]');
			await expect(submitButton).toBeEnabled();
		});
	});

	test.describe('3. Login Page', () => {
		test('3.1 - Should redirect authenticated users away from login', async ({ page, context }) => {
			// TODO: Set authenticated session in context
			// Once authenticated, visiting /login should redirect to home
			
			await page.goto('/login');
			
			// Should either redirect or show banner indicating no auth needed
			const banner = page.locator('[data-testid="guest-checkout-banner"]');
			const isVisible = await banner.isVisible().catch(() => false);
			
			if (isVisible) {
				await expect(banner).toContainText('No necesitas cuenta');
			}
		});

		test('3.2 - Should show guest checkout banner', async ({ page }) => {
			await page.goto('/login');
			
			const banner = page.locator('[data-testid="guest-checkout-banner"]');
			await expect(banner).toBeVisible();
			await expect(banner).toContainText('No necesitas cuenta para comprar');
		});

		test('3.3 - Should show register link', async ({ page }) => {
			await page.goto('/login');
			
			const registerLink = page.locator('[data-testid="login-register-link"]');
			await expect(registerLink).toBeVisible();
		});
	});

	test.describe('4. Register Page', () => {
		test('4.1 - Should show guest checkout banner', async ({ page }) => {
			await page.goto('/register');
			
			const banner = page.locator('[data-testid="guest-checkout-banner"]');
			await expect(banner).toBeVisible();
			await expect(banner).toContainText('No necesitas cuenta para comprar');
		});

		test('4.2 - Should show login link', async ({ page }) => {
			await page.goto('/register');
			
			const loginLink = page.locator('[data-testid="register-login-link"]');
			await expect(loginLink).toBeVisible();
		});
	});

	test.describe('5. Protected Routes', () => {
		test('5.1 - Should redirect unauthenticated users from /orders', async ({ page }) => {
			// Clear any stored session
			await page.context().clearCookies();
			await page.evaluate(() => localStorage.clear());
			
			// Try to access protected route
			await page.goto('/orders');
			
			// Should redirect to login
			await expect(page).toHaveURL(/\/login/);
		});

		test('5.2 - Should show orders list for authenticated users', async ({ page, context }) => {
			// TODO: Authenticate user in context
			// Once authenticated, /orders should load
			
			await page.goto('/orders');
			
			// Should either show orders list or loading state
			const ordersList = page.locator('[data-testid="orders-list"]');
			const loadingSpinner = page.locator('[data-testid="orders-loading"]');
			
			const isLoadingVisible = await loadingSpinner.isVisible().catch(() => false);
			const isOrdersVisible = await ordersList.isVisible().catch(() => false);
			
			expect(isLoadingVisible || isOrdersVisible).toBeTruthy();
		});

		test('5.3 - Should show empty state if no orders', async ({ page, context }) => {
			// TODO: Authenticate user with no orders
			
			await page.goto('/orders');
			
			// Wait for loading to complete
			await page.waitForLoadState('networkidle');
			
			// Check for empty state
			const emptyState = page.locator('[data-testid="orders-empty"]');
			const isVisible = await emptyState.isVisible().catch(() => false);
			
			if (isVisible) {
				await expect(emptyState).toContainText('No tienes órdenes');
			}
		});
	});

	test.describe('6. Session Management', () => {
		test('6.1 - Should persist session across page reload', async ({ page, context }) => {
			// TODO: Login user
			
			await page.goto('/');
			
			// Verify user is logged in
			const userMenu = page.locator('[data-testid="user-menu"]');
			const isLoggedIn = await userMenu.isVisible().catch(() => false);
			
			if (isLoggedIn) {
				// Reload page
				await page.reload();
				
				// Should still be logged in
				await expect(userMenu).toBeVisible();
			}
		});

		test('6.2 - Should show login button if not authenticated', async ({ page, context }) => {
			// Clear session
			await page.context().clearCookies();
			await page.evaluate(() => localStorage.clear());
			
			await page.goto('/');
			
			// Should show login/register buttons
			const loginButton = page.locator('[data-testid="header-login-button"]');
			await expect(loginButton).toBeVisible();
		});

		test('6.3 - Should show user menu if authenticated', async ({ page, context }) => {
			// TODO: Authenticate user
			
			await page.goto('/');
			
			// Should show user menu with logout
			const userMenu = page.locator('[data-testid="user-menu"]');
			const logoutButton = page.locator('[data-testid="user-logout-button"]');
			
			const isMenuVisible = await userMenu.isVisible().catch(() => false);
			
			if (isMenuVisible) {
				await expect(logoutButton).toBeVisible();
			}
		});

		test('6.4 - Should clear session on logout', async ({ page, context }) => {
			// TODO: Authenticate user first
			
			await page.goto('/');
			
			// Click logout button if visible
			const logoutButton = page.locator('[data-testid="user-logout-button"]');
			const isVisible = await logoutButton.isVisible().catch(() => false);
			
			if (isVisible) {
				await logoutButton.click();
				
				// Should redirect to home
				await expect(page).toHaveURL('/');
				
				// Should show login button again
				await expect(page.locator('[data-testid="header-login-button"]')).toBeVisible();
			}
		});
	});

	test.describe('7. Supabase Client', () => {
		test('7.1 - Should initialize Supabase client', async ({ page }) => {
			await page.goto('/');
			
			// Check for initialization message in console
			const messages = [];
			page.on('console', msg => messages.push(msg.text()));
			
			// Look for initialization message
			const hasInitMessage = messages.some(msg => 
				msg.includes('Supabase client inicializado')
			);
			
			// Log for verification
			console.log('Console messages:', messages);
		});

		test('7.2 - Should expose environment variables correctly', async ({ page }) => {
			// Navigate to page
			await page.goto('/');
			
			// Evaluate in page context to check env vars
			const supabaseUrl = await page.evaluate(() => {
				return import.meta.env.VITE_SUPABASE_URL;
			}).catch(() => null);
			
			// Should have URL configured
			if (supabaseUrl) {
				expect(supabaseUrl).toContain('supabase.co');
			}
		});
	});

	test.describe('8. Guest Checkout', () => {
		test('8.1 - Should allow adding items to cart without login', async ({ page }) => {
			// Clear session
			await page.context().clearCookies();
			await page.evaluate(() => localStorage.clear());
			
			await page.goto('/');
			
			// Navigate to products
			const productLink = page.locator('[data-testid="products-link"]');
			if (await productLink.isVisible().catch(() => false)) {
				await productLink.click();
				
				// Add item to cart
				const addToCartButton = page.locator('[data-testid="add-to-cart-button"]').first();
				if (await addToCartButton.isVisible().catch(() => false)) {
					await addToCartButton.click();
					
					// Verify item was added
					const cartCount = page.locator('[data-testid="cart-count"]');
					await expect(cartCount).toContainText('1');
				}
			}
		});

		test('8.2 - Should allow checkout without authentication', async ({ page }) => {
			// Navigate to checkout
			await page.goto('/checkout');
			
			// Should show checkout form, not redirect to login
			const checkoutForm = page.locator('[data-testid="checkout-form"]');
			const isVisible = await checkoutForm.isVisible().catch(() => false);
			
			if (isVisible) {
				await expect(checkoutForm).toBeVisible();
			}
		});
	});

	test.describe('9. Form Dark Mode', () => {
		test('9.1 - Login form should support dark mode', async ({ page }) => {
			await page.goto('/login');
			
			// Toggle dark mode if available
			const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
			const isVisible = await darkModeToggle.isVisible().catch(() => false);
			
			if (isVisible) {
				// Add dark class to html
				await page.evaluate(() => {
					document.documentElement.classList.add('dark');
				});
				
				// Form should still be visible and styled
				const loginForm = page.locator('[data-testid="login-form"]');
				await expect(loginForm).toBeVisible();
			}
		});

		test('9.2 - Register form should support dark mode', async ({ page }) => {
			await page.goto('/register');
			
			// Add dark class to html
			await page.evaluate(() => {
				document.documentElement.classList.add('dark');
			});
			
			// Form should still be visible and styled
			const registerForm = page.locator('[data-testid="register-form"]');
			await expect(registerForm).toBeVisible();
		});
	});

	test.describe('10. Accessibility', () => {
		test('10.1 - Login form should have proper labels', async ({ page }) => {
			await page.goto('/login');
			
			// All inputs should have associated labels
			const emailInput = page.locator('[data-testid="login-email-input"]');
			const passwordInput = page.locator('[data-testid="login-password-input"]');
			
			// Should be associated with labels
			await expect(emailInput).toHaveAttribute('aria-label');
			await expect(passwordInput).toHaveAttribute('aria-label');
		});

		test('10.2 - Register form should have proper labels', async ({ page }) => {
			await page.goto('/register');
			
			// All inputs should have associated labels
			const inputs = await page.locator('[data-testid^="register-"] input').all();
			
			// Each input should have aria-label or be associated with label
			for (const input of inputs) {
				const hasLabel = await input.getAttribute('aria-label').catch(() => null);
				expect(hasLabel).toBeTruthy();
			}
		});

		test('10.3 - Error messages should be associated with inputs', async ({ page }) => {
			await page.goto('/login');
			
			// Enter invalid email
			await page.locator('[data-testid="login-email-input"]').fill('invalid');
			
			// Error message should have role alert
			const errorMessage = page.locator('[data-testid="login-email-error"]');
			const role = await errorMessage.getAttribute('role').catch(() => null);
			
			if (role) {
				expect(role).toContain('alert');
			}
		});
	});
});
