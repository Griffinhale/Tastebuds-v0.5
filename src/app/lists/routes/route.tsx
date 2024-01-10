import { NextRequest } from "next/server";
import supabase from "@/app/utils/supabaseClient";

export async function POST(req: NextRequest) {
//create new list with variable number of items, title, private marker, and description

const body = await req.json();
console.log(body)

//parse body of request for title of list, private marker, and items
//check log in state from body - if not logged in return error
//push to userlists, lists, and listitems
//return success or failure response
}

export async function GET(req: NextRequest) {
//retrieve list view to allow modification before POST call


console.log("GETREQUEST")

//determine whether this is grabbing a subset of lists or one list in particular 
//(depending on format of the body req) and login state of user

//if sorting included or default,
    //return all lists, in two arrays. one for the users lists (if logged in) and one for public lists in general
    //if user not logged in, return only public lists

//if list_id and title
    //determine whether this is a favorited or personal list

    //if private set to true, check permissions. compare userlists table (has user_id and list_id)
        //if not accessible, return error
        //if accessible, return listItems merged with lists for that list

    //if private set to false, return listItems merged with lists for that list
}

export async function UPDATE(req: NextRequest) {
//update existing list, either adding or removing items\
//confirm user_id for that list, if not correct, return error
//grab current listItems, compare with req, add/remove the diff, change order as needed

}

export async function DELETE(req: NextRequest) {
//remove list in entirety

//confirm user_id for that list, if not correct, return error

//if permission granted, remove list from DB
}