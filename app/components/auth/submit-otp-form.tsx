import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

export function SubmitOTPForm({ length = 8, onChange = () => { } }: { length?: number; onChange: () => void }) {
    return (
        <div className="mb-4">
            <InputOTP maxLength={8} name="code" id="code" onChange={onChange} >
                <InputOTPGroup>
                    {Array(length)
                        .fill(null)
                        .map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                        ))}
                </InputOTPGroup>
            </InputOTP>
        </div>
    );
}