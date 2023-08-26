import { NextRequest, NextResponse } from "next/server";
import { redirect } from 'next/navigation';
import supabase from "../../utils/supabaseClient";

export async function POST(req: NextRequest)  {
    const body = await req.json();
  console.log(body);
  if (body.type ==="signup") {
    const { data, error } = await supabase.auth.signUp(
    {
      email: body.email,
      password: body.password,
      options: {
        data: {
          screen_name: body.screen_name,
        }
      }
    }
  )
  console.log(data);
    if (error) {
        console.log(error);
    }
    let response = NextResponse.json({status: 200, data: data});
    
    let userData = {
      token: data.session.access_token,
      userId: data.session.user.id
    }
    console.log(userData)
    response.cookies.set('auth_data', JSON.stringify(userData));
    return response;
  } else if (body.type === "login") {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password
    })

    
    if (error) {
        console.log(error);
      if (error.status === 400){
        return NextResponse.json({error: "invalid login credentials"})
      }
    }

    
    let response = NextResponse.json({status: 200, data: data});
    let userData = {
      token: data.session.access_token,
      userId: data.session.user.id,
      screenName: data.session.user.user_metadata.screen_name
    }
    console.log(userData);
    
    response.cookies.set('auth_data', JSON.stringify(userData));
    
    return response;
  }
  
}
