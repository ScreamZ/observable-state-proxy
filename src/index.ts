import type { Tagged } from "type-fest";

type Subscriber<T> = (newValue: T) => void;
type SubscriptionsMap = {
	[property: string]: Set<Subscriber<unknown>>;
};

// Store subscriptions in a WeakMap to associate them with each proxy
const subscriptionsMap = new WeakMap<object, SubscriptionsMap>();

/**
 * A proxy object with observable properties.
 */
export type ObservableState<T> = Tagged<T, "ObservableState">;

/**
 * Create a proxy object with observable properties.
 *
 * Inspired by valtio library, this proxy is optimized for Embedded JavaScript. With a low memory footprint and no dependencies, it provides a simple way to manage state and trigger updates.
 *
 * As a limitation this proxy only support flat objects, and does not support nested objects.
 */
export function createObservableState<T extends object>(
	target: T,
): ObservableState<T> {
	const subscriptions: SubscriptionsMap = {};

	const handler: ProxyHandler<T> = {
		set(obj, prop, value) {
			if (obj[prop as keyof T] !== value) {
				obj[prop as keyof T] = value; // Update the value

				// Notify all subscribers
				const registeredListeners = subscriptions[prop as string];
				if (registeredListeners) {
					for (const callback of registeredListeners) {
						callback(value);
					}
				}
			}
			return true;
		},
	};

	const proxy = new Proxy(target, handler);
	subscriptionsMap.set(proxy, subscriptions); // Associate subscriptions with the proxy
	return proxy as ObservableState<T>;
}

/**
 * Subscribe to changes on a specific key of a proxy object.
 */
export function subscribeKey<
	T extends ObservableState<object>,
	K extends keyof T,
>(proxy: T, key: K, callback: Subscriber<T[K]>) {
	// biome-ignore lint/style/noNonNullAssertion: This is defined for sure
	const subscriptions = subscriptionsMap.get(proxy)!;

	// Lazy init
	if (!subscriptions[key as string]) subscriptions[key as string] = new Set();

	subscriptions[key as string]?.add(callback as Subscriber<unknown>);

	return () =>
		subscriptions[key as string]?.delete(callback as Subscriber<unknown>);
}
