import { NextRequest, NextResponse } from "next/server";
import { redirect } from 'next/navigation';
import supabase from "../../utils/supabaseClient";

// API route to handle POST requests for user authentication
export async function POST(req: NextRequest)  {
    // Parse the request body
    const body = await req.json();
    console.log(body);

    // Handle user signup
    if (body.type ==="signup") {
        // Use Supabase to create a new user
        const { data, error } = await supabase.auth.signUp({
            email: body.email,
            password: body.password,
            options: {
                data: {
                    screen_name: body.screen_name, // Including additional user data
                }
            }
        });

        console.log(data); // Log the response for debugging
        if (error) {
            console.log(error); // Log any errors
        }

        // Create a JSON response with the user data
        let response = NextResponse.json({status: 200, data: data});
        console.log(response); // Log the response
        // Extract and store user data in a cookie
        let userData = {
            token: data.session.access_token,
            userId: data.session.user.id,
            screenName: data.session.user.user_metadata.screen_name
        };
        console.log(userData); // Log user data for debugging
        response.cookies.set('auth_data', JSON.stringify(userData)); // Set cookie

        return response;
    } else if (body.type === "login") {
        // Handle user login
        const { data, error } = await supabase.auth.signInWithPassword({
            email: body.email,
            password: body.password
        });

        if (error) {
            console.log(error); // Log any errors
            if (error.status === 400){
                // Return error response for invalid credentials
                return NextResponse.json({error: "invalid login credentials"})
            }
        }

        // Create a JSON response with the user data
        let response = NextResponse.json({status: 200, data: data});
        
        // Extract and store user data in a cookie
        let userData = {
            token: data.session.access_token,
            userId: data.session.user.id,
            screenName: data.session.user.user_metadata.screen_name
        };
        console.log(userData); // Log user data for debugging
        
        response.cookies.set('auth_data', JSON.stringify(userData)); // Set cookie
        
        return response;
    }
}