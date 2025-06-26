const sdk = require('microsoft-cognitiveservices-speech-sdk');

class SpeechService {
    constructor() {
        this.speechKey = process.env.AZURE_SPEECH_KEY;
        this.speechRegion = process.env.AZURE_SPEECH_REGION || 'eastus';
        this.speechLanguage = process.env.SPEECH_LANGUAGE || 'en-US';
    }

    async textToSpeech(text) {
        try {
            if (!this.speechKey) {
                console.log('Azure Speech Service not configured');
                return null;
            }

            const speechConfig = sdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
            speechConfig.speechSynthesisLanguage = this.speechLanguage;
            speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

            const synthesizer = sdk.SpeechSynthesizer.fromConfig(speechConfig);

            return new Promise((resolve, reject) => {
                synthesizer.speakTextAsync(text,
                    result => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            console.log(`Speech synthesis completed for text: ${text}`);
                            resolve(result.audioData);
                        } else {
                            console.error(`Speech synthesis failed: ${result.errorDetails}`);
                            reject(new Error(result.errorDetails));
                        }
                        synthesizer.close();
                    },
                    error => {
                        console.error('Speech synthesis error:', error);
                        synthesizer.close();
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error('Error in textToSpeech:', error);
            throw error;
        }
    }

    async speechToText(audioData) {
        try {
            if (!this.speechKey) {
                console.log('Azure Speech Service not configured');
                return "Speech recognition is not configured. Please set AZURE_SPEECH_KEY environment variable.";
            }

            const speechConfig = sdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
            speechConfig.speechRecognitionLanguage = this.speechLanguage;

            const audioConfig = sdk.AudioConfig.fromWavFileInput(audioData);
            const recognizer = sdk.SpeechRecognizer.fromConfig(speechConfig, audioConfig);

            return new Promise((resolve, reject) => {
                recognizer.recognizeOnceAsync(result => {
                    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                        console.log(`Speech recognized: ${result.text}`);
                        resolve(result.text);
                    } else if (result.reason === sdk.ResultReason.NoMatch) {
                        console.log('No speech could be recognized.');
                        resolve('No speech could be recognized.');
                    } else {
                        console.error(`Speech recognition failed: ${result.errorDetails}`);
                        reject(new Error(result.errorDetails));
                    }
                    recognizer.close();
                }, error => {
                    console.error('Speech recognition error:', error);
                    recognizer.close();
                    reject(error);
                });
            });
        } catch (error) {
            console.error('Error in speechToText:', error);
            throw error;
        }
    }

    async startContinuousRecognition(onRecognized, onRecognizing) {
        try {
            if (!this.speechKey) {
                throw new Error('Azure Speech Service not configured');
            }

            const speechConfig = sdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
            speechConfig.speechRecognitionLanguage = this.speechLanguage;

            const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = sdk.SpeechRecognizer.fromConfig(speechConfig, audioConfig);

            recognizer.recognizing = (s, e) => {
                if (onRecognizing) {
                    onRecognizing(e.result.text);
                }
            };

            recognizer.recognized = (s, e) => {
                if (e.result.reason === sdk.ResultReason.RecognizedSpeech && onRecognized) {
                    onRecognized(e.result.text);
                }
            };

            recognizer.canceled = (s, e) => {
                console.log(`Speech recognition canceled: ${e.reason}`);
                if (e.reason === sdk.CancellationReason.Error) {
                    console.error(`Error details: ${e.errorDetails}`);
                }
                recognizer.stopContinuousRecognitionAsync();
            };

            recognizer.sessionStopped = (s, e) => {
                console.log('Speech recognition session stopped.');
                recognizer.stopContinuousRecognitionAsync();
            };

            recognizer.startContinuousRecognitionAsync();
            
            return recognizer;
        } catch (error) {
            console.error('Error starting continuous recognition:', error);
            throw error;
        }
    }

    getAvailableVoices() {
        return [
            'en-US-JennyNeural',
            'en-US-GuyNeural',
            'en-US-AriaNeural',
            'en-US-DavisNeural',
            'en-US-AmberNeural',
            'en-US-AnaNeural',
            'en-US-AndrewNeural',
            'en-US-EmmaNeural',
            'en-US-BrianNeural'
        ];
    }

    getSupportedLanguages() {
        return [
            'en-US', 'en-GB', 'en-AU', 'en-CA',
            'es-ES', 'es-MX', 'fr-FR', 'fr-CA',
            'de-DE', 'it-IT', 'pt-BR', 'ja-JP',
            'ko-KR', 'zh-CN', 'zh-TW'
        ];
    }
}

module.exports.SpeechService = SpeechService;