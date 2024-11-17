import { describe, expect, it, vi } from "vitest";
import { createObservableState, subscribeKey } from "./index.js";

describe("createObservableState", () => {
	it("should create a proxy object", () => {
		const target = { a: 1 };
		const proxy = createObservableState(target);
		expect(proxy).not.toBe(target);
		expect(proxy.a).toBe(1);
	});

	it("should notify subscribers on property change", () => {
		const target = { a: 1 };
		const proxy = createObservableState(target);
		const callback = vi.fn();

		subscribeKey(proxy, "a", callback);
		proxy.a = 2;

		expect(callback).toHaveBeenCalledWith(2);
	});

	it("should not notify subscribers if property value is unchanged", () => {
		const target = { a: 1 };
		const proxy = createObservableState(target);
		const callback = vi.fn();

		subscribeKey(proxy, "a", callback);
		proxy.a = 1;

		expect(callback).not.toHaveBeenCalled();
	});
});

describe("subscribeKey", () => {
	it("should subscribe to changes on a specific key", () => {
		const target = { a: 1 };
		const proxy = createObservableState(target);
		const callback = vi.fn();

		const unsubscribe = subscribeKey(proxy, "a", callback);
		proxy.a = 2;

		expect(callback).toHaveBeenCalledWith(2);

		unsubscribe();
		proxy.a = 3;

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("should handle multiple subscribers for the same key", () => {
		const target = { a: 1 };
		const proxy = createObservableState(target);
		const callback1 = vi.fn();
		const callback2 = vi.fn();

		subscribeKey(proxy, "a", callback1);
		subscribeKey(proxy, "a", callback2);
		proxy.a = 2;

		expect(callback1).toHaveBeenCalledWith(2);
		expect(callback2).toHaveBeenCalledWith(2);
	});
});
