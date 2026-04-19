const { Notification } = require('../models');
const mongoose = require('mongoose');

async function sendNotification(payload) {
  try {
    const notification = new Notification({
      recipientId: new mongoose.Types.ObjectId(payload.recipientId),
      event: payload.event,
      title: payload.title,
      message: payload.message,
      data: payload.data || {},
      read: false,
      createdAt: new Date(),
    });

    const saved = await notification.save();
    console.log(
      `📬 Notification sent to ${payload.recipientId}: ${payload.title}`
    );
    return saved;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

async function notifyHomeworkAssigned(studentIds, homeworkTitle, dueDate) {
  for (const studentId of studentIds) {
    await sendNotification({
      recipientId: studentId,
      event: 'homework_assigned',
      title: 'नया गृहपाठ',
      message: `नया गृहपाठ दिया गया: ${homeworkTitle}`,
      data: {
        homeworkTitle,
        dueDate,
      },
    });
  }
}

async function notifyGradePosted(studentId, subject, score, maxScore) {
  const percentage = ((score / maxScore) * 100).toFixed(1);
  await sendNotification({
    recipientId: studentId,
    event: 'grade_posted',
    title: 'आपका स्कोर प्रकाशित हुआ',
    message: `${subject}: ${score}/${maxScore} (${percentage}%)`,
    data: {
      subject,
      score,
      maxScore,
      percentage,
    },
  });
}

async function notifyMeetingScheduled(parentId, teacherName, meetingDate, meetingMode) {
  await sendNotification({
    recipientId: parentId,
    event: 'meeting_scheduled',
    title: 'मीटिंग निर्धारित की गई',
    message: `${teacherName} के साथ ${meetingDate} को ${meetingMode} मीटिंग`,
    data: {
      teacherName,
      meetingDate,
      meetingMode,
    },
  });
}

async function notifyAttendanceMarked(studentId, status, date) {
  const statusMap = {
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    late: 'देर से',
  };

  try {
    const { Student } = require('../models');
    const student = await Student.findOne({ studentUserId: studentId });
    if (student && student.parentUserId) {
      await sendNotification({
        recipientId: student.parentUserId.toString(),
        event: 'attendance_marked',
        title: 'उपस्थिति अपडेट',
        message: `${date} को: ${statusMap[status]}`,
        data: {
          status,
          date,
        },
      });
    }
  } catch (error) {
    console.error('Error notifying attendance:', error);
  }
}

async function notifyHomeworkCompleted(teacherId, studentName, homeworkTitle) {
  await sendNotification({
    recipientId: teacherId,
    event: 'homework_completed',
    title: 'गृहपाठ पूर्ण हुआ',
    message: `${studentName} ने ${homeworkTitle} पूर्ण किया`,
    data: {
      studentName,
      homeworkTitle,
    },
  });
}

async function notifyAnnouncementPosted(recipientIds, announcementTitle) {
  for (const recipientId of recipientIds) {
    await sendNotification({
      recipientId,
      event: 'announcement_posted',
      title: 'नई घोषणा',
      message: announcementTitle,
      data: {
        announcementTitle,
      },
    });
  }
}

async function getUnreadNotifications(userId) {
  try {
    const objectId = new mongoose.Types.ObjectId(userId);
    const notifications = await Notification.find({
      recipientId: objectId,
      read: false,
    }).sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
}

async function markNotificationAsRead(notificationId) {
  try {
    const result = await Notification.findByIdAndUpdate(notificationId, {
      read: true,
      readAt: new Date(),
    });

    return !!result;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

async function deleteNotification(notificationId) {
  try {
    const result = await Notification.findByIdAndDelete(notificationId);
    return !!result;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

module.exports = {
  sendNotification,
  notifyHomeworkAssigned,
  notifyGradePosted,
  notifyMeetingScheduled,
  notifyAttendanceMarked,
  notifyHomeworkCompleted,
  notifyAnnouncementPosted,
  getUnreadNotifications,
  markNotificationAsRead,
  deleteNotification,
};
