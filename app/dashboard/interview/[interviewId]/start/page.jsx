'use client'

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import {useEffect, useState} from 'react'
import Questions from './_components/Questions';
import RecordAnswer from './_components/RecordAnswer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
const StartInterview = ({params}) => {

    const [interviewData, setInterviewData] = useState();
    const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    useEffect(()=>{
        GetInterviewDetails();
    },[])

    // used to get interview details by mockid/ interview id

    const GetInterviewDetails = async () => {
        const result = await db.select().from(MockInterview).where(eq(MockInterview.mockId,params.interviewId))

        const jsonMockResp = JSON.parse(result[0].jsonMockResp)
        console.log(jsonMockResp);
        setMockInterviewQuestion(jsonMockResp);
        setInterviewData(result[0]);
       
    }

    return(
        <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                {/* questions */}

                <Questions mockInterviewQuestion= {mockInterviewQuestion} activeQuestionIndex={activeQuestionIndex} />

                {/* video and audio recording */}

                <RecordAnswer mockInterviewQuestion= {mockInterviewQuestion} activeQuestionIndex={activeQuestionIndex} interviewData={interviewData} />
            </div>
            <div className='flex justify-end gap-6'>
              {activeQuestionIndex>0 &&  <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex-1)}>Previous Question</Button> }
              {activeQuestionIndex!=mockInterviewQuestion?.length-1 &&  <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)}>Next Question</Button> }
              {activeQuestionIndex==mockInterviewQuestion?.length-1 && <Link href={'/dashboard/interview/'+interviewData?.mockId+'/feedback'}> <Button>End Interview</Button> </Link> }
            </div>
        </div>
    )
}

export default StartInterview;