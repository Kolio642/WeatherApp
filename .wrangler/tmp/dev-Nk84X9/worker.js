(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // .wrangler/tmp/bundle-x9QYb2/checked-fetch.js
  var urls = /* @__PURE__ */ new Set();
  function checkURL(request, init) {
    const url = request instanceof URL ? request : new URL(
      (typeof request === "string" ? new Request(request, init) : request).url
    );
    if (url.port && url.port !== "443" && url.protocol === "https:") {
      if (!urls.has(url.toString())) {
        urls.add(url.toString());
        console.warn(
          `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
        );
      }
    }
  }
  __name(checkURL, "checkURL");
  globalThis.fetch = new Proxy(globalThis.fetch, {
    apply(target, thisArg, argArray) {
      const [request, init] = argArray;
      checkURL(request, init);
      return Reflect.apply(target, thisArg, argArray);
    }
  });

  // node_modules/wrangler/templates/middleware/common.ts
  var __facade_middleware__ = [];
  function __facade_register__(...args) {
    __facade_middleware__.push(...args.flat());
  }
  __name(__facade_register__, "__facade_register__");
  function __facade_registerInternal__(...args) {
    __facade_middleware__.unshift(...args.flat());
  }
  __name(__facade_registerInternal__, "__facade_registerInternal__");
  function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
    const [head, ...tail] = middlewareChain;
    const middlewareCtx = {
      dispatch,
      next(newRequest, newEnv) {
        return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
      }
    };
    return head(request, env, ctx, middlewareCtx);
  }
  __name(__facade_invokeChain__, "__facade_invokeChain__");
  function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
    return __facade_invokeChain__(request, env, ctx, dispatch, [
      ...__facade_middleware__,
      finalMiddleware
    ]);
  }
  __name(__facade_invoke__, "__facade_invoke__");

  // node_modules/wrangler/templates/middleware/loader-sw.ts
  var __FACADE_EVENT_TARGET__;
  if (globalThis.MINIFLARE) {
    __FACADE_EVENT_TARGET__ = new (Object.getPrototypeOf(WorkerGlobalScope))();
  } else {
    __FACADE_EVENT_TARGET__ = new EventTarget();
  }
  function __facade_isSpecialEvent__(type) {
    return type === "fetch" || type === "scheduled";
  }
  __name(__facade_isSpecialEvent__, "__facade_isSpecialEvent__");
  var __facade__originalAddEventListener__ = globalThis.addEventListener;
  var __facade__originalRemoveEventListener__ = globalThis.removeEventListener;
  var __facade__originalDispatchEvent__ = globalThis.dispatchEvent;
  globalThis.addEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.addEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalAddEventListener__(type, listener, options);
    }
  };
  globalThis.removeEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.removeEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalRemoveEventListener__(type, listener, options);
    }
  };
  globalThis.dispatchEvent = function(event) {
    if (__facade_isSpecialEvent__(event.type)) {
      return __FACADE_EVENT_TARGET__.dispatchEvent(event);
    } else {
      return __facade__originalDispatchEvent__(event);
    }
  };
  globalThis.addMiddleware = __facade_register__;
  globalThis.addMiddlewareInternal = __facade_registerInternal__;
  var __facade_waitUntil__ = Symbol("__facade_waitUntil__");
  var __facade_response__ = Symbol("__facade_response__");
  var __facade_dispatched__ = Symbol("__facade_dispatched__");
  var __Facade_ExtendableEvent__ = class extends Event {
    [__facade_waitUntil__] = [];
    waitUntil(promise) {
      if (!(this instanceof __Facade_ExtendableEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this[__facade_waitUntil__].push(promise);
    }
  };
  __name(__Facade_ExtendableEvent__, "__Facade_ExtendableEvent__");
  var __Facade_FetchEvent__ = class extends __Facade_ExtendableEvent__ {
    #request;
    #passThroughOnException;
    [__facade_response__];
    [__facade_dispatched__] = false;
    constructor(type, init) {
      super(type);
      this.#request = init.request;
      this.#passThroughOnException = init.passThroughOnException;
    }
    get request() {
      return this.#request;
    }
    respondWith(response) {
      if (!(this instanceof __Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      if (this[__facade_response__] !== void 0) {
        throw new DOMException(
          "FetchEvent.respondWith() has already been called; it can only be called once.",
          "InvalidStateError"
        );
      }
      if (this[__facade_dispatched__]) {
        throw new DOMException(
          "Too late to call FetchEvent.respondWith(). It must be called synchronously in the event handler.",
          "InvalidStateError"
        );
      }
      this.stopImmediatePropagation();
      this[__facade_response__] = response;
    }
    passThroughOnException() {
      if (!(this instanceof __Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#passThroughOnException();
    }
  };
  __name(__Facade_FetchEvent__, "__Facade_FetchEvent__");
  var __Facade_ScheduledEvent__ = class extends __Facade_ExtendableEvent__ {
    #scheduledTime;
    #cron;
    #noRetry;
    constructor(type, init) {
      super(type);
      this.#scheduledTime = init.scheduledTime;
      this.#cron = init.cron;
      this.#noRetry = init.noRetry;
    }
    get scheduledTime() {
      return this.#scheduledTime;
    }
    get cron() {
      return this.#cron;
    }
    noRetry() {
      if (!(this instanceof __Facade_ScheduledEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#noRetry();
    }
  };
  __name(__Facade_ScheduledEvent__, "__Facade_ScheduledEvent__");
  __facade__originalAddEventListener__("fetch", (event) => {
    const ctx = {
      waitUntil: event.waitUntil.bind(event),
      passThroughOnException: event.passThroughOnException.bind(event)
    };
    const __facade_sw_dispatch__ = /* @__PURE__ */ __name(function(type, init) {
      if (type === "scheduled") {
        const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
          scheduledTime: Date.now(),
          cron: init.cron ?? "",
          noRetry() {
          }
        });
        __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
        event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      }
    }, "__facade_sw_dispatch__");
    const __facade_sw_fetch__ = /* @__PURE__ */ __name(function(request, _env, ctx2) {
      const facadeEvent = new __Facade_FetchEvent__("fetch", {
        request,
        passThroughOnException: ctx2.passThroughOnException
      });
      __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
      facadeEvent[__facade_dispatched__] = true;
      event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      const response = facadeEvent[__facade_response__];
      if (response === void 0) {
        throw new Error("No response!");
      }
      return response;
    }, "__facade_sw_fetch__");
    event.respondWith(
      __facade_invoke__(
        event.request,
        globalThis,
        ctx,
        __facade_sw_dispatch__,
        __facade_sw_fetch__
      )
    );
  });
  __facade__originalAddEventListener__("scheduled", (event) => {
    const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
      scheduledTime: event.scheduledTime,
      cron: event.cron,
      noRetry: event.noRetry.bind(event)
    });
    __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
    event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
  });

  // node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
  var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } finally {
      try {
        if (request.body !== null && !request.bodyUsed) {
          const reader = request.body.getReader();
          while (!(await reader.read()).done) {
          }
        }
      } catch (e) {
        console.error("Failed to drain the unused request body.", e);
      }
    }
  }, "drainBody");
  var middleware_ensure_req_body_drained_default = drainBody;

  // node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
  function reduceError(e) {
    return {
      name: e?.name,
      message: e?.message ?? String(e),
      stack: e?.stack,
      cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
    };
  }
  __name(reduceError, "reduceError");
  var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } catch (e) {
      const error = reduceError(e);
      return Response.json(error, {
        status: 500,
        headers: { "MF-Experimental-Error-Stack": "true" }
      });
    }
  }, "jsonError");
  var middleware_miniflare3_json_error_default = jsonError;

  // .wrangler/tmp/bundle-x9QYb2/middleware-insertion-facade.js
  __facade_registerInternal__([middleware_ensure_req_body_drained_default, middleware_miniflare3_json_error_default]);

  // dist/worker.js
  (() => {
    "use strict";
    ;
    async function fetchFromApi(apiUrl) {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "max-age=1800",
            // Cache for 30 minutes
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Error fetching from Weather API" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    __name(fetchFromApi, "fetchFromApi");
    ;
    const BASE_URL = "https://api.weatherapi.com/v1";
    async function handleApiRequest(event, apiKey) {
      const url = new URL(event.request.url);
      const path = url.pathname;
      const queryParams = url.searchParams;
      if (path === "/api/weather") {
        return await handleWeatherRequest(queryParams, apiKey);
      }
      if (path === "/api/forecast") {
        return await handleForecastRequest(queryParams, apiKey);
      }
      if (path === "/api/cities") {
        return await handleCitiesRequest(queryParams, apiKey);
      }
      return new Response(JSON.stringify({ error: "API endpoint not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    __name(handleApiRequest, "handleApiRequest");
    async function handleWeatherRequest(queryParams, apiKey) {
      const city = queryParams.get("city");
      const lat = queryParams.get("lat");
      const lon = queryParams.get("lon");
      let apiUrl;
      if (city) {
        apiUrl = `${BASE_URL}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=yes`;
      } else if (lat && lon) {
        apiUrl = `${BASE_URL}/current.json?key=${apiKey}&q=${lat},${lon}&aqi=yes`;
      } else {
        return new Response(JSON.stringify({ error: "City name or coordinates are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      return await fetchFromApi(apiUrl);
    }
    __name(handleWeatherRequest, "handleWeatherRequest");
    async function handleForecastRequest(queryParams, apiKey) {
      const city = queryParams.get("city");
      const lat = queryParams.get("lat");
      const lon = queryParams.get("lon");
      const days = queryParams.get("days") || 5;
      let apiUrl;
      if (city) {
        apiUrl = `${BASE_URL}/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;
      } else if (lat && lon) {
        apiUrl = `${BASE_URL}/forecast.json?key=${apiKey}&q=${lat},${lon}&days=${days}&aqi=no&alerts=no`;
      } else {
        return new Response(JSON.stringify({ error: "City name or coordinates are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      return await fetchFromApi(apiUrl);
    }
    __name(handleForecastRequest, "handleForecastRequest");
    async function handleCitiesRequest(queryParams, apiKey) {
      const q = queryParams.get("q");
      if (!q || q.length < 3) {
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const apiUrl = `${BASE_URL}/search.json?key=${apiKey}&q=${encodeURIComponent(q)}`;
      return await fetchFromApi(apiUrl);
    }
    __name(handleCitiesRequest, "handleCitiesRequest");
    ;
    async function serveStaticAsset(event) {
      const url = new URL(event.request.url);
      let path = url.pathname;
      if (path === "/" || path === "") {
        path = "/index.html";
      }
      try {
        const response = await fetch(new Request(url.origin + path, {
          headers: event.request.headers,
          method: "GET"
        }));
        if (response.status === 404) {
          return new Response(`Not Found: ${path}`, {
            status: 404,
            headers: { "Content-Type": "text/plain" }
          });
        }
        const headers = new Headers(response.headers);
        headers.set("Cache-Control", "public, max-age=3600");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } catch (e) {
        return new Response(`Error serving ${path}: ${e.message}`, {
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      }
    }
    __name(serveStaticAsset, "serveStaticAsset");
    ;
    const WEATHER_API_KEY = typeof self.WEATHER_API_KEY !== "undefined" ? self.WEATHER_API_KEY : "";
    addEventListener("fetch", (event) => {
      event.respondWith(handleEvent(event));
    });
    async function handleEvent(event) {
      const url = new URL(event.request.url);
      const path = url.pathname;
      try {
        if (path.startsWith("/api/")) {
          return await handleApiRequest(event, WEATHER_API_KEY);
        }
        return await serveStaticAsset(event);
      } catch (e) {
        return new Response("Internal Error: " + e.message, {
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      }
    }
    __name(handleEvent, "handleEvent");
    addEventListener("fetch", (event) => {
      event.respondWith(handleRequest(event.request));
    });
    async function handleRequest(request) {
      return new Response("Hello World! The Worker is running correctly.", {
        headers: { "Content-Type": "text/plain" }
      });
    }
    __name(handleRequest, "handleRequest");
  })();
})();
//# sourceMappingURL=worker.js.map
