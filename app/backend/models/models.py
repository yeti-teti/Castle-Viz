from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from database import Base

class Users(Base):

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, index=True)
    email = Column(String(255), index=True)
    password = Column(String, index=True)

    payments = relationship("Payments", back_populates="user")
    bills = relationship("Bills", back_populates="user")

class Payments(Base):

    __tablename__ = "payments"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    category = Column(String, index=True)
    vendor = Column(String)
    amount = Column(Integer, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("Users", back_populates="payments")

class Bills(Base):

    __tablename__ = "bills"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    category = Column(String, index=True)
    vendor = Column(String, index=True)
    amount = Column(Integer, index=True)
    status = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("Users", back_populates="bills")