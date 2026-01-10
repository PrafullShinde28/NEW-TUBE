"use Client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton ,SignOutButton, UserButton } from "@clerk/nextjs";
import {  UserCircleIcon } from "lucide-react";

export const AuthButton = ()=>{
    //add different auth state
    return(
        <>
        <SignedIn>
            <UserButton/>
            {/* add menu items for studio and user profile */}
        </SignedIn>
            <SignedOut>
        <SignOutButton>
            <SignInButton mode="modal">
                <Button 
                    variant="outline"
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-500 border-blue-500/20
                    rounded-full shadow-none [%_svg]:size-4
                    ">
                <UserCircleIcon/>
                Sign In
               </Button>
             </SignInButton>
           </SignOutButton>
         </SignedOut>
        </>
    )
}