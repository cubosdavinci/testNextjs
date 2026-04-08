const requestUrl = new URL(request.url);

// Base URL: use NGROK_URL from .env if defined, otherwise fallback to request.origin
const baseUrl = process.env.NGROK_URL?.trim() || requestUrl.origin;

// Build the search string: copy existing query params + add/override message
const searchParams = new URLSearchParams(requestUrl.search);
searchParams.set('message', 'google_already_linked');

// Construct full redirect URL with template literal
const redirectUrl = `${baseUrl}/dashboard?${searchParams.toString()}`;

return NextResponse.redirect(redirectUrl);


new URLSearchParams('foo=bar&baz=42');
new URLSearchParams({ message: 'This is right or wrong?' });
new URLSearchParams([['message', 'This is right or wrong?']]);
```

---

### 2. Why your version is wrong

```ts
new URLSearchParams('message','This is right or wrong?');
```

* You passed **two separate arguments**.
* `URLSearchParams` only takes **one argument**.
* ✅ This will throw a TypeError.

---

### 3. Correct ways to create it

**Option A — Object syntax (most readable)**

```ts
const params = new URLSearchParams({ message: 'This is right or wrong?' });
```

**Option B — Array syntax**

```ts
const params = new URLSearchParams([['message', 'This is right or wrong?']]);
```

**Option C — Query string syntax**

```ts
const params = new URLSearchParams('message=This+is+right+or+wrong%3F');
```

> `%3F` is URL-encoded `?`

---

### ✅ TL;DR

* **Wrong:** `new URLSearchParams('message','value')`
* **Right:** either object, array, or single query string

---

If you want, I can rewrite your redirect snippet using `URLSearchParams` **properly with template literals**, so the query string merges cleanly. Do you want me to do that?
