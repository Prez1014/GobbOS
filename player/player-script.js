function initPlayer() {
    const audio = document.getElementById("audio-element");
    const playBtn = document.getElementById("play-pause");
    const stopBtn = document.getElementById("stop-track");
    const prevBtn = document.getElementById("previous-video");
    const nextBtn = document.getElementById("next-video");
    const progress = document.getElementById("progress");
    const currentTimeEl = document.getElementById("current-time");
    const durationEl = document.getElementById("duration");
    const statusEl = document.getElementById("player-status");
    const trackTitleEl = document.getElementById("track-title");
    const trackArtistEl = document.getElementById("track-artist");
    const albumArtEl = document.getElementById("album-art");
    const themeSelect = document.getElementById("theme-selector");
    const playlistContainer = document.getElementById("playlist-items");

    let currentCategory = "lofi";
    let currentTrackIndex = 0;

    const lofiPath = "../music/lofi/";
    const umpPath = "../music/ump/";

    const musicLibrary = {
        lofi: {
            icon: "☕",
            tracks: [
                { title: "Deltarune - My Castle Town", artist: "Toby Fox", src: lofiPath + "my_castle_town.mp3" },
                { title: "Bird of Paradise", artist: "Daniel Koestner", src: lofiPath + "bird_of_paradise.mp3" },
                { title: "Breaking Ground", artist: "Daniel Koestner", src: lofiPath + "breaking_ground.mp3" },
                { title: "Clocktowers Beneath the Sea", artist: "Pascal Michael Stiefel", src: lofiPath + "clocktowers_beneath_the_sea.mp3" },
                { title: "Dance of the Moonlight jellies", artist: "ConcernedApe", src: lofiPath + "dance_of_the_moonlight_jellies.mp3" },
                { title: "Fall", artist: "ConcernedApe", src: lofiPath + "fall.mp3" },
                { title: "Garbage Day", artist: "Daniel Koestner", src: lofiPath + "garbage_day.mp3" },
                { title: "Hateno Village (BOTW)", artist: "Yasuaki Iwata", src: lofiPath + "hateno_village.mp3" },
                { title: "Rito Village", artist: "Yasuaki Iwata", src: lofiPath + "rito_village.mp3" },
                { title: "Undiscovery", artist: "Lifeformed", src: lofiPath + "undiscovery.mp3" },
                { title: "Winter (Ancient)", artist: "ConcernedApe", src: lofiPath + "winter_ancient.mp3" }
            ]
        },
        gym: {
            icon: "🏋️",
            tracks: [
                { title: "Dance..", artist: "Slayyter", src: umpPath + "dance.mp3" },
                { title: "Dark Horse", artist: "Katy Perry", src: umpPath + "dark_horse.mp3" },
                { title: "I Kissed A Girl", artist: "Katy Perry", src: umpPath + "i_kissed_a_girl.mp3" },
                { title: "I'll Do It", artist: "Heidi Montag", src: umpPath + "ill_do_it.mp3" },
                { title: "Just Dance", artist: "Lady Gaga", src: umpPath + "just_dance.mp3" }
            ]
        }
    };
    const formatTime = seconds => {
        if (!Number.isFinite(seconds) || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, "0")}`;
    };

    function renderPlaylist() {
        playlistContainer.innerHTML = "";
        const categoryData = musicLibrary[currentCategory];
        albumArtEl.textContent = categoryData.icon;

        categoryData.tracks.forEach((track, index) => {
            const li = document.createElement("li");
            li.textContent = `${index + 1}. ${track.title}`;
            if (index === currentTrackIndex) {
                li.classList.add("playing");
            }

            li.addEventListener("click", () => {
                loadTrack(index, true);
            });

            playlistContainer.appendChild(li);
        });
    }

    function loadTrack(index, autoPlay = false) {
        const categoryTracks = musicLibrary[currentCategory].tracks;
        if (!categoryTracks || categoryTracks.length === 0) {
            statusEl.textContent = "No tracks found in this category.";
            return;
        }

        currentTrackIndex = index;
        const track = categoryTracks[currentTrackIndex];

        audio.src = track.src;
        trackTitleEl.textContent = track.title;
        trackArtistEl.textContent = track.artist;
        statusEl.textContent = `Loaded: ${track.title}`;

        renderPlaylist();

        if (autoPlay) {
            audio.play().catch(err => {
                console.warn("Autoplay blocked or file not found:", err);
                statusEl.textContent = "Click play or verify file path.";
            });
        }
    }

    playBtn.addEventListener("click", () => {
        if (!audio.src) {
            loadTrack(0, true);
            return;
        }

        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });

    audio.addEventListener("play", () => {
        playBtn.textContent = "⏸";
        statusEl.textContent = "Playing...";
    });

    audio.addEventListener("pause", () => {
        playBtn.textContent = "▶";
        statusEl.textContent = "Paused.";
    });

    stopBtn.addEventListener("click", () => {
        audio.pause();
        audio.currentTime = 0;
        playBtn.textContent = "▶";
        statusEl.textContent = "Stopped.";
    });

    prevBtn.addEventListener("click", () => {
        const categoryTracks = musicLibrary[currentCategory].tracks;
        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) newIndex = categoryTracks.length - 1;
        loadTrack(newIndex, true);
    });

    nextBtn.addEventListener("click", () => {
        const categoryTracks = musicLibrary[currentCategory].tracks;
        let newIndex = (currentTrackIndex + 1) % categoryTracks.length;
        loadTrack(newIndex, true);
    });

    audio.addEventListener("ended", () => {
        const categoryTracks = musicLibrary[currentCategory].tracks;
        let newIndex = (currentTrackIndex + 1) % categoryTracks.length;
        loadTrack(newIndex, true);
    });

    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);
        progress.value = (audio.currentTime / audio.duration) * 100;
    });

    progress.addEventListener("input", () => {
        if (!audio.duration) return;
        audio.currentTime = (progress.value / 100) * audio.duration;
    });

    themeSelect.addEventListener("change", e => {
        currentCategory = e.target.value;
        currentTrackIndex = 0;
        audio.pause();
        loadTrack(0, false);
    });

    renderPlaylist();
    loadTrack(0, false);
}
