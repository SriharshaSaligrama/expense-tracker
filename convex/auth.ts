import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./resend_otp";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Google,
        ResendOTP,
        Password<DataModel>({
            id: "password-custom",
            profile(params, _ctx) {
                return {
                    email: params.email as string,
                    name: params.name as string,
                };
            },
        }),
    ],
});

