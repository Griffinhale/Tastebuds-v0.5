import { NextRequest, NextResponse } from "next/server";
import supabase from "../../utils/supabaseClient";

// API route to handle POST requests for user authentication
export async function POST(req: NextRequest) {
    const body = await req.json();

    if (body.type === "signup") {
        const { data, error } = await supabase.auth.signUp({
            email: body.email,
            password: body.password,
            options: {
                data: {
                    screen_name: body.screen_name,
                }
            }
        });

        if (error) {
            return NextResponse.json({ error: error.message });
        }

        const userData = {
            token: data.session!.access_token,
            userId: data.session!.user.id,
            screenName: data.session!.user.user_metadata.screen_name,
            email: body.email
        };

        return NextResponse.json({ status: 200, data: userData });
    } else if (body.type === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: body.email,
            password: body.password
        });

        if (error) {
            if (error.status === 400) {
                return NextResponse.json({ error: "invalid login credentials" });
            }
            return NextResponse.json({ error: error.message });
        }

        const userData = {
            token: data.session!.access_token,
            userId: data.session!.user.id,
            screenName: data.session!.user.user_metadata.screen_name,
            email: body.email
        };

        return NextResponse.json({ status: 200, data: userData });
    }
}