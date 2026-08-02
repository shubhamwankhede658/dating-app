import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config)=>{
    //config — an object describing that specific request (its URL, method, headers, body, etc., before it's actually sent out).
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization= `Bearer ${token}`;
    }
    return config;
})

export default api;

/**
 * When we tested this manually in Postman, we typed that header in ourselves, every single time. But in our real app, we're going to call these protected routes from many different pages — Discover, Profile, Chat, etc. Writing the same header-attaching code manually in every single one of those API calls would be repetitive and easy to forget.

So instead, we set this up once, and it automatically happens for every request, everywhere in the app, without us thinking about it again.

 */
/**
 * An interceptor is a way to say: "before ANY request goes out using this api object, automatically run this piece of code first, and modify the request if needed." We set it up once, here, and it applies everywhere api is used, forever.
 The full flow, in order, when you call any api.get(...) or api.post(...) anywhere in the app:
You write code like api.get("/match/profiles") somewhere (e.g., in the Discover page, later)
Before axios actually sends this out over the internet, it pauses and runs our interceptor function
Our function checks localStorage for a saved token
If found, it silently attaches Authorization: Bearer <token> to this specific request's headers
It returns the modified config
Only now does axios actually send the request out, complete with that header already attached
Our backend's protectRoute middleware reads that header and confirms who's making the request — exactly like it did when we tested manually in Postman
 */