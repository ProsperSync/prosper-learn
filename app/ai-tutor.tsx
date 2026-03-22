import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { openaiClient, isOpenAIConfigured } from '../src/config/openai';
import { EducationalTutorService } from '../src/lib/ai/educationalTutor';
import { educationalTrackEngine } from '../src/lib/ai';
import type { ConversationMessage, Lesson } from '../src/lib/types';

interface ChatMessage extends ConversationMessage {
  id: string;
}

export default function AITutorScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Resolve lesson if lessonId was provided
  const lesson: Lesson | undefined = lessonId
    ? educationalTrackEngine.getLessonById(lessonId) ?? undefined
    : undefined;

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    if (!isOpenAIConfigured || !openaiClient) {
      // Show a user-facing error in the chat
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content:
          'AI features are not available yet. The OpenAI API key has not been configured. Please contact support or try again later.',
      };
      setMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}-user`, role: 'user', content: text },
        errorMsg,
      ]);
      setInputText('');
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSending(true);

    try {
      const tutor = new EducationalTutorService(openaiClient);
      const conversationHistory: ConversationMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const context = {
        lesson: lesson ?? {
          id: 'general',
          trackId: 'general',
          title: 'General Financial Education',
          description: 'Ask any question about personal finance.',
          type: 'article' as const,
          content: { body: '' },
          order: 0,
          xpReward: 0,
        },
        userLevel: 1,
        language: 'en' as const,
        conversationHistory,
      };

      const response = await tutor.answerQuestion(text, context);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Tutor error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content:
          'Sorry, I had trouble processing your question. Please try again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  }, [inputText, sending, messages, lesson]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{'\u2190'}</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Tutor</Text>
          {lesson && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {lesson.title}
            </Text>
          )}
        </View>
      </View>

      {/* Unavailable Banner */}
      {!isOpenAIConfigured && (
        <View style={styles.unavailableBanner}>
          <Text style={styles.unavailableText}>
            AI Tutor requires an OpenAI API key. Features will become available
            once configured.
          </Text>
        </View>
      )}

      {/* Empty State */}
      {messages.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>{'\uD83E\uDDD1\u200D\uD83C\uDFEB'}</Text>
          <Text style={styles.emptyTitle}>Ask me anything!</Text>
          <Text style={styles.emptySubtitle}>
            {lesson
              ? `I can help you understand "${lesson.title}" better.`
              : 'Ask any question about personal finance and I\'ll help you learn.'}
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask a question..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!sending}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>{'\u2191'}</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#4CAF50',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  unavailableBanner: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  unavailableText: {
    fontSize: 13,
    color: '#E65100',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
