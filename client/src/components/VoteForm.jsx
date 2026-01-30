import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { voteApi } from "../services/api";
import toast from "react-hot-toast";
import LanguageIcon from "@mui/icons-material/Language";
import { useLanguage } from "../contexts/LanguageContext";

const VoteForm = () => {
  const { language, toggleLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    answer: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bilingual content
  const content = {
    ar: {
      title: "🗳️  استفتاء",
      question: "استفتاء لتفويض اللجنة التنفيذية او اختيار لجنة جديدة ",
      options: ["Yes", "No"],
      nameLabel: "الاسم الكامل",
      nameHelper:
        "الاسم يجب أن يكون فريداً (بما في ذلك الأسماء المتشابهة بالعربية)",
      phoneLabel: "رقم الهاتف",
      phoneHelper: "أدخل رقم هاتفك (مثال: +966500000000)",
      selectLabel: "اختر إجابتك",
      selectPlaceholder: "اختر خيارًا",
      alertMessage:
        "ملاحظة: يمكن لكل رقم هاتف التصويت مرة واحدة فقط. تصويتك مجهول ولكن يتم تتبع الرقم لمنع التكرار.",
      alertMessage2:
        " ملاحظة: نعم = اوافق علي تفويض اللجنة التنفيذية الحالية لمتابعة المهام ، لا = اختيار لجنة جديدة",
      submitButton: "إرسال التصويت",
      submitting: "جاري الإرسال...",
      errors: {
        nameRequired: "الاسم مطلوب",
        nameMinLength: "الاسم يجب أن يكون على الأقل حرفين",
        nameDuplicate: "هذا الاسم (أو اسم مشابه بالعربية) تم استخدامه مسبقاً",
        phoneRequired: "رقم الهاتف مطلوب",
        phoneInvalid: "الرجاء إدخال رقم هاتف صحيح",
        phoneDuplicate: "رقم الهاتف هذا تم استخدامه للتصويت مسبقاً",
        answerRequired: "الرجاء اختيار إجابة",
        invalidAnswer: "إجابة غير صالحة",
        generalError: "حدث خطأ أثناء إرسال التصويت",
        serverError: "خطأ في الخادم، يرجى المحاولة لاحقاً",
      },
      success: "تم إرسال التصويت بنجاح!",
      error: "فشل في إرسال التصويت",
      validationError: "خطأ في التحقق من البيانات",
    },
    en: {
      title: "🗳️ Poll",
      question:
        "A poll to authorize the Executive Committee or select a new committee",
      options: ["Yes", "No"],
      nameLabel: "Full Name",
      nameHelper:
        "The name must be unique (including similar names written in Arabic)",
      phoneLabel: "Phone Number",
      phoneHelper: "Enter your phone number (example: +966500000000)",
      selectLabel: "Select Your Answer",
      selectPlaceholder: "Choose an option",
      alertMessage:
        "Note: Each phone number can vote only once. Your vote is anonymous, but the number is tracked to prevent duplicate voting.",
      alertMessage2:
        "Note: Yes = I agree to authorize the current Executive Committee to continue its duties. No = Select a new committee.",
      submitButton: "Submit Vote",
      submitting: "Submitting...",
      errors: {
        nameRequired: "Name is required",
        nameMinLength: "Name must be at least 2 characters long",
        nameDuplicate:
          "This name (or a similar Arabic name) has already been used",
        phoneRequired: "Phone number is required",
        phoneInvalid: "Please enter a valid phone number",
        phoneDuplicate: "This phone number has already been used to vote",
        answerRequired: "Please select an answer",
        invalidAnswer: "Invalid answer",
        generalError: "An error occurred while submitting the vote",
        serverError: "Server error, please try again later",
      },
      success: "Your vote has been submitted successfully!",
      error: "Failed to submit vote",
      validationError: "Validation error",
    },
  };

  const current = content[language];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = current.errors.nameRequired;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = current.errors.nameMinLength;
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanedPhone = formData.phone.replace(/[\s\-\(\)\.]/g, "");
    if (!formData.phone.trim()) {
      newErrors.phone = current.errors.phoneRequired;
    } else if (!phoneRegex.test(cleanedPhone)) {
      newErrors.phone = current.errors.phoneInvalid;
    }

    if (!formData.answer) {
      newErrors.answer = current.errors.answerRequired;
    } else if (!["Yes", "No"].includes(formData.answer)) {
      newErrors.answer = current.errors.invalidAnswer;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(current.validationError, {
        position: language === "ar" ? "top-left" : "top-right",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean phone number before sending
      const cleanedPhone = formData.phone.replace(/[\s\-\(\)\.]/g, "");
      const voteData = {
        ...formData,
        phone: cleanedPhone,
      };

      const response = await voteApi.submitVote(voteData);

      if (response.data.success) {
        toast.success(current.success, {
          position: language === "ar" ? "top-left" : "top-right",
        });
        // Reset form
        setFormData({
          name: "",
          phone: "",
          answer: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Vote submission error:", error);

      // Handle different types of errors
      let errorMessage = current.errors.generalError;
      const backendMessage = error.response?.data?.message;

      // Check for specific error types
      if (error.response?.status === 409) {
        // Duplicate phone or name
        if (
          backendMessage?.includes("phone") ||
          backendMessage?.includes("Phone")
        ) {
          setErrors((prev) => ({
            ...prev,
            phone: current.errors.phoneDuplicate,
          }));
          errorMessage = current.errors.phoneDuplicate;
        } else if (
          backendMessage?.includes("name") ||
          backendMessage?.includes("Name") ||
          backendMessage?.includes("already taken") ||
          backendMessage?.includes("مستخدم")
        ) {
          setErrors((prev) => ({
            ...prev,
            name: current.errors.nameDuplicate,
          }));
          errorMessage = current.errors.nameDuplicate;
        } else {
          errorMessage = backendMessage || current.errors.phoneDuplicate;
        }
      } else if (error.response?.status === 400) {
        // Validation error
        if (backendMessage) {
          // Try to extract field-specific errors
          if (
            backendMessage.includes("Name") ||
            backendMessage.includes("اسم")
          ) {
            setErrors((prev) => ({
              ...prev,
              name:
                backendMessage.includes("already taken") ||
                backendMessage.includes("مستخدم")
                  ? current.errors.nameDuplicate
                  : backendMessage,
            }));
            errorMessage = current.errors.nameDuplicate;
          } else if (
            backendMessage.includes("Phone") ||
            backendMessage.includes("هاتف")
          ) {
            setErrors((prev) => ({
              ...prev,
              phone: current.errors.phoneInvalid,
            }));
            errorMessage = current.errors.phoneInvalid;
          } else if (
            backendMessage.includes("Answer") ||
            backendMessage.includes("إجابة")
          ) {
            setErrors((prev) => ({
              ...prev,
              answer: current.errors.invalidAnswer,
            }));
            errorMessage = current.errors.invalidAnswer;
          } else {
            errorMessage = backendMessage;
          }
        }
      } else if (error.response?.status === 500) {
        errorMessage = current.errors.serverError;
      }

      toast.error(errorMessage, {
        position: language === "ar" ? "top-left" : "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRTL = language === "ar";
  const fontFamily = isRTL ? "'Rubik', sans-serif" : "'Inter', sans-serif";

  return (
    <Card
      elevation={3}
      sx={{
        maxWidth: 600,
        margin: "0 auto",
        mt: 4,
        direction: isRTL ? "rtl" : "ltr",
        textAlign: isRTL ? "right" : "left",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            fontFamily={fontFamily}
            sx={{ flex: 1 }}
          >
            {current.title}
          </Typography>
          <IconButton onClick={toggleLanguage} color="primary">
            <LanguageIcon />
          </IconButton>
        </Box>

        <Typography
          variant="body1"
          paragraph
          align={isRTL ? "right" : "left"}
          sx={{ mb: 3 }}
          fontFamily={fontFamily}
          fontSize="1.1rem"
        >
          {current.question}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={current.nameLabel}
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || current.nameHelper}
                required
                disabled={isSubmitting}
                inputProps={{
                  style: {
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: fontFamily,
                  },
                  maxLength: 100,
                }}
                InputLabelProps={{
                  style: {
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: fontFamily,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={current.phoneLabel}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone || current.phoneHelper}
                required
                disabled={isSubmitting}
                inputProps={{
                  style: {
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: fontFamily,
                  },
                }}
                dir="ltr"
                InputLabelProps={{
                  style: {
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: fontFamily,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={!!errors.answer}
                required
                sx={{
                  textAlign: isRTL ? "right" : "left",
                  "& .MuiSelect-select": {
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: fontFamily,
                  },
                }}
              >
                <InputLabel
                  style={{
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: fontFamily,
                  }}
                >
                  {current.selectLabel}
                </InputLabel>
                <Select
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  label={current.selectLabel}
                  disabled={isSubmitting}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em style={{ fontFamily: fontFamily }}>
                      {current.selectPlaceholder}
                    </em>
                  </MenuItem>
                  {current.options.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      style={{
                        textAlign: isRTL ? "right" : "left",
                        fontFamily: fontFamily,
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.answer && (
                  <Typography
                    variant="caption"
                    color="error"
                    style={{
                      textAlign: isRTL ? "right" : "left",
                      fontFamily: fontFamily,
                    }}
                  >
                    {errors.answer}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Alert
                severity="info"
                sx={{
                  mb: 2,
                  textAlign: isRTL ? "right" : "left",
                  direction: isRTL ? "rtl" : "ltr",
                }}
              >
                <Typography variant="body2" style={{ fontFamily: fontFamily }}>
                  {current.alertMessage2}
                </Typography>
              </Alert>
              <Alert
                severity="info"
                sx={{
                  mb: 2,
                  textAlign: isRTL ? "right" : "left",
                  direction: isRTL ? "rtl" : "ltr",
                }}
              >
                <Typography variant="body2" style={{ fontFamily: fontFamily }}>
                  {current.alertMessage}
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                sx={{
                  fontFamily: fontFamily,
                  fontSize: "1rem",
                }}
              >
                {isSubmitting ? current.submitting : current.submitButton}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VoteForm;
