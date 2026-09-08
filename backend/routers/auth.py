from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "tehsildar"

@router.post("/login")
def login(req: LoginRequest):
    return {
        "access_token": f"jwt_mock_token_for_{req.role}_user",
        "token_type": "bearer",
        "user": {
            "name": "Rajesh Sharma, IRS" if req.role == "tehsildar" else "Vikram Singh Patwari",
            "email": req.email,
            "role": req.role,
            "district": "Lucknow"
        }
    }
