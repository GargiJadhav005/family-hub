// Central model export file
const { User } = require('./User');
const { Student } = require('./Student');
const { Homework } = require('./Homework');
const { HomeworkStatus } = require('./HomeworkStatus');
const { Attendance } = require('./Attendance');
const { Score } = require('./Score');
const { ReportCard } = require('./ReportCard');
const { Announcement } = require('./Announcement');
const { Notification } = require('./Notification');
const { Enquiry } = require('./Enquiry');
const { Event } = require('./Event');
const { Meeting } = require('./Meeting');
const { Instruction } = require('./Instruction');
const { Quiz, QuizResult } = require('./Quiz');
const { Course } = require('./Course');

module.exports = {
  User,
  Student,
  Homework,
  HomeworkStatus,
  Attendance,
  Score,
  ReportCard,
  Announcement,
  Notification,
  Enquiry,
  Event,
  Meeting,
  Instruction,
  Quiz,
  QuizResult,
  Course,
};
