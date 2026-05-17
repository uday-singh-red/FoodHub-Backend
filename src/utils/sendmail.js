import { Resend } from "resend"

const resend = new Resend(
  process.env.RESEND_API_KEY
)

export const sendEmail = async (email,otp) => {

  try {
    const response =
    await resend.emails.send({

      from:"onboarding@resend.dev",
      to:email,
      subject:"OTP Verification",
      html:`
        <h1>Your OTP is:</h1>
        <h2>${otp}</h2>
      `
    })

    console.log(response)

  } catch (error) {
    console.log(error)

  }
}