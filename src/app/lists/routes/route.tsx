import { NextRequest } from "next/server";
import supabase from "@/app/utils/supabaseClient";

export async function POST(req: NextRequest) {
//create new list with variable number of items, title, private marker, and description

// OR fetch lists for viewing in ListBrowser

const body = await req.json();
console.log(body)

//parse body of request for title of list, private marker, and items
//check log in state from body - if not logged in return error
//push to userlists, lists, and listitems
//return success or failure response
}

export async function GET(req: NextRequest) {
//retrieve list view to allow modification before POST call at save. Only used for single list


console.log("GETREQUEST")

//check login state of user

    //determine whether this is a favorited or personal list

    //if private set to true, check permissions. compare userlists table (has user_id and list_id)
        //if not accessible, return error
        //if accessible, return listItems joined with lists on the id key

    //if private set to false, return listItems joined with lists on the id key
}


//change this to either PUT or PATCH (thinking PUT rn, even though it has to send whole list I think it will be easier to track changes)
/*export async function UPDATE(req: NextRequest) {
//update existing list, either adding or removing items\
//confirm user_id for that list, if not correct, return error
//grab current listItems, compare with req, add/remove the diff, change order as needed

}*/

export async function DELETE(req: NextRequest) {
//remove list in entirety

//confirm user_id for that list, if not correct, return error

//if permission granted, remove list from DB
}