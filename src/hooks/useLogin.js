import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import useShowToast from "./useShowToast";
import { auth, firestore } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";

const useLogin = () => {
	const showToast = useShowToast();
	const [signInWithEmailAndPassword, , loading, error] = useSignInWithEmailAndPassword(auth);
	const loginUser = useAuthStore((state) => state.login);

	const login = async (inputs) => {
		if (!inputs.email || !inputs.password) {
			return showToast("Error", "Please fill all the fields", "error");
		}
		try {
			const userCred = await signInWithEmailAndPassword(inputs.email, inputs.password);

			if (userCred) {
				const fallbackUser = {
					uid: userCred.user.uid,
					email: userCred.user.email,
					displayName: userCred.user.displayName || "Anonymous",
					photoURL: userCred.user.photoURL || null,
				};

				let storedUser = fallbackUser;

				try {
					const docRef = doc(firestore, "users", userCred.user.uid);
					const docSnap = await getDoc(docRef);
					if (docSnap.exists()) {
						storedUser = { ...fallbackUser, ...docSnap.data() };
					}
				} catch (profileError) {
					console.warn("Could not load user profile, using auth fallback:", profileError);
				}

				localStorage.setItem("user-info", JSON.stringify(storedUser));
				loginUser(storedUser);
				return storedUser;
			}
		} catch (error) {
			showToast("Error", error.message, "error");
			return null;
		}
	};

	return { loading, error, login };
};

export default useLogin;
