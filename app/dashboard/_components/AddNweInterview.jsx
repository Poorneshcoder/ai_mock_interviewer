'use client'
import { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { v4 as uuidv4 } from 'uuid';
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

  


const AddNewInterview = () => {


    const [openDialog, setOpenDialog] = useState(false);
    const [jobPosition, setJobPosition] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobExperience, setJobExperience] = useState('');
    const [loading, setLoading] = useState(false);
    const [jsonResponse, setJsonResponse] = useState([]);
    const {user}= useUser();
    const router = useRouter();


    const onSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        console.log(jobPosition, jobDescription, jobExperience);
        setLoading(false);

        const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}, Depends on this information please give me ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview question with answers in json format. Give question and answer as fields in json`;

        const result = await chatSession.sendMessage(InputPrompt);
        const MockJsonResponse = (result.response.text()).replace('```json','').replace('```','');
        console.log(JSON.parse(MockJsonResponse));
        setJsonResponse(MockJsonResponse);

        if(MockJsonResponse){
        const response= await db.insert(MockInterview)
        .values({
          mockId:uuidv4(),
          jsonMockResp:MockJsonResponse,
          jobPosition:jobPosition,
          jobDesc:jobDescription,
          jobExperience:jobExperience,
          createdBy:user?.primaryEmailAddress?.emailAddress,
          createdAt:moment().format('DD-MM-YYYY')
        }).returning({mockId:MockInterview.mockId});

        console.log("inserted id : " , response);
        if(response){
          setOpenDialog(false);
          router.push('/dashboard/interview/'+response[0]?.mockId)
        }
      } else{
        console.log('error ')
      }

        setLoading(false);







    }



    return(
        <div>
      <div className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all" onClick={() => setOpenDialog(true)}>
        <h2 className='font-bold text-lg text-center'>+ Add New</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tell us about your job</DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>Add details about your job position/role, job description and years of experience.</h2>
                  <div className='mt-7 my-4'>
                    <label>Job Role/Job Position</label>
                    <Input
                      placeholder='Ex: Full Stack Developer'
                      required
                      onChange={(e) => setJobPosition(e.target.value)}
                    />
                  </div>
                  <div className='my-4'>
                    <label>Job Description</label>
                    <Textarea
                      placeholder='Ex: React, Angular, Node js, Express MongoDB '
                      required
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                  <div className='my-4'>
                    <label>Years of Experience</label>
                    <Input
                      placeholder='Ex: 5'
                      type="number"
                      max='25'
                      required
                      onChange={(e) => setJobExperience(e.target.value)}
                    />
                  </div>
                </div>
                <div className='flex gap-5 justify-end'>
                  <Button type='button' variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button type='submit' disabled={loading}>
                    {loading ?
                      <>
                        <LoaderCircle className='animate-spin' />'Generate from AI'
                      </> : ' Start Interview '
                    }
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
    )
}

export default AddNewInterview;

