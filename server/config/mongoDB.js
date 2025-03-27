const mongoose = require('mongoose');

// MongoDB connection setup
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('MongoDB connected successfully');
    await initializeDatabase();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Define Mongoose schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'teacher', 'student'] },
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }
});

const teacherSubjectSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  status: { type: String, required: true, enum: ['present', 'absent'] }
}, { timestamps: true });

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  assignment1: { type: Number, default: 0 },
  assignment2: { type: Number, default: 0 },
  ut: { type: Number, default: 0 },
  behavior: { type: Number, default: 0 }
}, { timestamps: true });

// Create models
const User = mongoose.model('User', userSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const TeacherSubject = mongoose.model('TeacherSubject', teacherSubjectSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Marks = mongoose.model('Marks', marksSchema);

// Initialize database with indexes
async function initializeDatabase() {
  await User.createIndexes();
  await Subject.createIndexes();
  await TeacherSubject.createIndexes();
  console.log('Database indexes created');
}

module.exports = {
  connectDB,
  User,
  Subject,
  TeacherSubject,
  Attendance,
  Marks
};