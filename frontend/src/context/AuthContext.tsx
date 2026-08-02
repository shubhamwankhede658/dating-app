import { createContext, useContext, useState, type ReactNode } from "react";


type User = {
  id: string;
  email: string;
  name: string;
  bio?: string;
  photoUrl?: string;
  age?: number;
  gender?: string;
  genderPreference?: string;
};

type AuthContextType = {//everyhtign i wnat to make available through context
    user: User | null;//either a real user obj or null if nobody is logged in 
    token: string | null;
    login: (user:User, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);// this return a context obj
//Calls createContext(), which returns a context object — we store it in the constant AuthContext. The <AuthContextType | undefined> part tells TypeScript what type of value this context will eventually hold. The (undefined) is the argument passed to createContext() — this is the default value, used only if a component tries to read this context without being wrapped in a Provider.


export function AuthProvider({children}:{children:ReactNode}){
    const [user, setUser] = useState<User | null>(
        localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
        /**localStorage.getItem("user") — reads a value stored under the key "user" in the browser's localStorage. Returns either a string, or null if nothing's stored.
condition ? value_if_true : value_if_false — if something was found (truthy), run JSON.parse(...) on it (converts the stored text back into a real JavaScript object). If nothing was found, use null instead. */
    );

    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    function login(user:User, token:string){
        setUser(user);
        setToken(token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token",token);
        /**
         * setUser(user) — calls the state setter from useState, updating React's internal user state.
           setToken(token) — same, for token.
           localStorage.setItem("user", JSON.stringify(user)) — saves data into the browser's storage under the key "user". localStorage can only store strings, so JSON.stringify(user) converts the user object into a string first.
           localStorage.setItem("token", token) — same, but token is already a string, so no conversion needed.
         */
    }

    function logout(){
        setUser(null);
        setToken(null);
        localStorage.remove("user");
        localStorage.remove("token");
    }


    return(
        <AuthContext.Provider value={{user, token, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
    /**The component's return value (its JSX output). <AuthContext.Provider> is a special component automatically attached to any context we create via createContext(). Its value prop is set to an object { user, token, login, logout } (shorthand for { user: user, token: token, login: login, logout: logout }) — this is the exact data any component can later read from this context. {children} renders whatever JSX was passed between the opening and closing tags when <AuthProvider> is used elsewhere. */
}


export function useAuth(){
    const context = useContext(AuthContext);
    /**
     * This line means: "Go find the nearest <AuthContext.Provider> above me in the component tree, and give me whatever was put inside its value={...}."

So, since we wrote:

typescript
value={{ user, token, login, logout }}

Then context here will literally become:

typescript
{ user: <current user or null>, token: <current token or null>, login: <
     */
    if(!context) throw new Error("useAuth must be used inside authprovider");
    return context;
    /**If we passed the safety check (meaning real data was found), just hand back that { user, token, login, logout } object to whoever called useAuth(). */


    
}
